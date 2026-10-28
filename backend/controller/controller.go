package controller

// Deprecated: HTTP adapters now live in internal/httpapi.
// This package retains a constructor alias without global mutable state.
import (
	"asyncflow/internal/httpapi"
	"asyncflow/internal/jobs"
	"asyncflow/internal/webhooks"
	"log/slog"
	"net/http"
)

// NewHandler constructs an HTTP adapter with explicit dependencies.
func NewHandler(service *jobs.Service, hooks *webhooks.Service, logger *slog.Logger, origin string) http.Handler {
	return httpapi.New(service, hooks, logger, origin)
}
