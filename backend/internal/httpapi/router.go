// Package httpapi adapts job and webhook services to HTTP.
package httpapi

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"asyncflow/internal/jobs"
	"asyncflow/internal/webhooks"
	"github.com/google/uuid"
)

type detail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}
type apiError struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []detail `json:"details,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	payload, err := json.Marshal(data)
	if err != nil {
		slog.Error("response encoding failed")
		status = http.StatusInternalServerError
		payload = []byte(`{"error":{"code":"INTERNAL_ERROR","message":"Erro interno"}}`)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if _, err := w.Write(payload); err != nil {
		slog.Warn("response write failed", "request_id", w.Header().Get("X-Request-ID"))
	}
}

func fail(w http.ResponseWriter, status int, code, message string, details ...detail) {
	writeJSON(w, status, struct {
		Error apiError `json:"error"`
	}{apiError{code, message, details}})
}

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		fail(w, 400, "VALIDATION_ERROR", "JSON inválido", detail{"body", "Envie um objeto JSON válido de até 16 KiB"})
		return false
	}
	if err := decoder.Decode(new(any)); err != io.EOF {
		fail(w, 400, "VALIDATION_ERROR", "JSON inválido", detail{"body", "Envie apenas um objeto JSON"})
		return false
	}
	return true
}

type statusWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (w *statusWriter) WriteHeader(status int) {
	if w.wroteHeader {
		return
	}
	w.wroteHeader = true
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *statusWriter) Write(payload []byte) (int, error) {
	if !w.wroteHeader {
		w.WriteHeader(http.StatusOK)
	}
	return w.ResponseWriter.Write(payload)
}

// New builds an isolated router with JSON access logs and configurable CORS.
func New(service *jobs.Service, hooks *webhooks.Service, logger *slog.Logger, origin string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) { writeJSON(w, 200, map[string]string{"status": "ok"}) })
	mux.HandleFunc("GET /jobs", func(w http.ResponseWriter, r *http.Request) { writeJSON(w, 200, service.List()) })
	mux.HandleFunc("POST /jobs", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Name     string `json:"name"`
			Priority int    `json:"priority"`
		}
		if !decode(w, r, &body) {
			return
		}
		job, err := service.Create(body.Name, body.Priority)
		if err != nil {
			fail(w, 400, "VALIDATION_ERROR", "Dados inválidos", detail{"name", "Informe entre 1 e 200 caracteres"}, detail{"priority", "Use 1, 2 ou 3"})
			return
		}
		w.Header().Set("Location", "/jobs/"+job.ID.String())
		logger.InfoContext(r.Context(), "job created", "job_id", job.ID.String(), "request_id", w.Header().Get("X-Request-ID"))
		writeJSON(w, 201, job)
	})
	mux.HandleFunc("GET /jobs/{id}", func(w http.ResponseWriter, r *http.Request) {
		job, ok := service.Get(r.PathValue("id"))
		if !ok {
			fail(w, 404, "JOB_NOT_FOUND", "Job não encontrado")
			return
		}
		writeJSON(w, 200, job)
	})
	mux.HandleFunc("POST /webhooks", func(w http.ResponseWriter, r *http.Request) {
		var body webhooks.Registration
		if !decode(w, r, &body) {
			return
		}
		if err := hooks.Register(body); err != nil {
			fail(w, 400, "VALIDATION_ERROR", "Webhook inválido", detail{"url", err.Error()}, detail{"event", "Use job.completed ou job.failed"})
			return
		}
		w.WriteHeader(http.StatusCreated)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		wrapped := &statusWriter{ResponseWriter: w, status: 200}
		requestID := uuid.NewString()
		wrapped.Header().Set("X-Request-ID", requestID)
		wrapped.Header().Set("X-Content-Type-Options", "nosniff")
		wrapped.Header().Set("Cache-Control", "no-store")
		wrapped.Header().Add("Vary", "Origin")
		defer func() {
			if recover() != nil {
				logger.Error("request panic recovered", "request_id", requestID)
				if !wrapped.wroteHeader {
					fail(wrapped, 500, "INTERNAL_ERROR", "Erro interno")
				}
			}
			logger.Info("http request completed", "request_id", requestID, "method", r.Method, "route", r.Pattern, "status_code", wrapped.status, "duration_ms", time.Since(started).Milliseconds())
		}()
		if r.Header.Get("Origin") == origin {
			wrapped.Header().Set("Access-Control-Allow-Origin", origin)
			wrapped.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")
		}
		if r.Method == http.MethodOptions {
			wrapped.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			wrapped.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			wrapped.WriteHeader(204)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/") && r.URL.Path != "/" {
			fail(wrapped, 404, "ROUTE_NOT_FOUND", "Rota não encontrada")
			return
		}
		_, pattern := mux.Handler(r)
		if pattern == "" {
			jobPath := strings.HasPrefix(r.URL.Path, "/jobs/") && strings.Count(r.URL.Path, "/") == 2
			knownPath := r.URL.Path == "/jobs" || r.URL.Path == "/health" || r.URL.Path == "/webhooks" || jobPath
			if knownPath {
				allowed := "GET"
				if r.URL.Path == "/jobs" {
					allowed = "GET, POST"
				}
				if r.URL.Path == "/webhooks" {
					allowed = "POST"
				}
				wrapped.Header().Set("Allow", allowed)
				fail(wrapped, 405, "METHOD_NOT_ALLOWED", "Método não permitido")
				return
			}
			fail(wrapped, 404, "ROUTE_NOT_FOUND", "Rota não encontrada")
			return
		}
		// ServeMux must populate path parameters before invoking the handler.
		mux.ServeHTTP(wrapped, r)
	})
}
