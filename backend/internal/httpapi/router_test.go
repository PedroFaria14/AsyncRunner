package httpapi

import (
	"asyncflow/internal/jobs"
	"asyncflow/internal/webhooks"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRoutes(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	router := New(jobs.New(), webhooks.New(logger), logger, "http://localhost:5173")
	for _, tc := range []struct {
		method, path, body string
		status             int
	}{
		{"GET", "/health", "", 200}, {"GET", "/jobs", "", 200},
		{"POST", "/jobs", `{"name":"test","priority":2}`, 201},
		{"POST", "/jobs", `{"name":"","priority":9}`, 400},
		{"POST", "/jobs", `{"name":"test","priority":2,"unknown":true}`, 400},
		{"POST", "/jobs", `{} {}`, 400}, {"POST", "/jobs", `null`, 400},
		{"GET", "/jobs/missing", "", 404}, {"GET", "/missing", "", 404},
		{"DELETE", "/jobs", "", 405},
		{"GET", "/jobs/not/a/route", "", 404},
		{"POST", "/webhooks", `{"url":"http://localhost","event":"job.completed"}`, 400},
	} {
		t.Run(tc.method+tc.path+tc.body, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			res := httptest.NewRecorder()
			router.ServeHTTP(res, req)
			if res.Code != tc.status {
				t.Fatalf("status %d: %s", res.Code, res.Body.String())
			}
			if res.Header().Get("X-Request-ID") == "" {
				t.Fatal("missing request id")
			}
			if res.Header().Get("Content-Type") != "application/json" {
				t.Fatal("non JSON response")
			}
		})
	}
	req := httptest.NewRequest(http.MethodOptions, "/jobs", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)
	if res.Code != 204 || res.Header().Get("Access-Control-Allow-Origin") == "" {
		t.Fatal("invalid preflight")
	}
}

func TestCreateThenGet(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	service := jobs.New()
	router := New(service, webhooks.New(logger), logger, "http://localhost:5173")
	res := httptest.NewRecorder()
	router.ServeHTTP(res, httptest.NewRequest("POST", "/jobs", strings.NewReader(`{"name":"created","priority":3}`)))
	if res.Code != 201 {
		t.Fatalf("create: %s", res.Body.String())
	}
	location := res.Header().Get("Location")
	if location == "" {
		t.Fatal("missing location")
	}
	get := httptest.NewRecorder()
	router.ServeHTTP(get, httptest.NewRequest("GET", location, nil))
	var payload struct {
		Name   string `json:"name"`
		Status string `json:"status"`
	}
	if err := json.Unmarshal(get.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if get.Code != 200 || payload.Name != "created" || payload.Status != "pending" {
		t.Fatalf("get: %s", get.Body.String())
	}
}
