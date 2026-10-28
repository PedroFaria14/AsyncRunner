// Package routes retains the original router entry point for local consumers.
package routes

import (
	"asyncflow/internal/httpapi"
	"asyncflow/internal/jobs"
	"asyncflow/internal/webhooks"
	"log/slog"
	"net/http"
)

// CarregaRotas returns an isolated router. Use httpapi.New for explicit composition.
func CarregaRotas() http.Handler {
	logger := slog.Default()
	return httpapi.New(jobs.New(), webhooks.New(logger), logger, "http://localhost:5173")
}
