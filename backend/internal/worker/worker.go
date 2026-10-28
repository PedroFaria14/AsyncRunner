// Package worker executes jobs using cancellable dependencies.
package worker

import (
	"asyncflow/internal/jobs"
	"asyncflow/queues"
	"context"
	"log/slog"
	"time"
)

// Worker claims jobs serially and delegates their execution.
type Worker struct {
	Jobs     *jobs.Service
	Execute  func(context.Context, queues.Job) error
	Notify   func(context.Context, queues.Job)
	Logger   *slog.Logger
	Interval time.Duration
}

// Step processes at most one job. Execution is injected for deterministic tests.
func (w *Worker) Step(ctx context.Context) bool {
	if ctx.Err() != nil {
		return false
	}
	job, ok := w.Jobs.Claim()
	if !ok {
		return false
	}
	err := w.Execute(ctx, job)
	updated, ok := w.Jobs.Finish(job.ID.String(), err)
	if !ok {
		return true
	}
	w.Logger.InfoContext(ctx, "job execution finished", "job_id", job.ID.String(), "attempt", updated.Attempts, "status", updated.JobStatus, "success", err == nil)
	if w.Notify != nil && (updated.JobStatus == queues.StatusCompleted || updated.JobStatus == queues.StatusFailed) {
		w.Notify(ctx, updated)
	}
	return true
}

// Run polls until cancellation, waiting between attempts to avoid hot retries.
func (w *Worker) Run(ctx context.Context) {
	interval := w.Interval
	if interval <= 0 {
		interval = time.Second
	}
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.Step(ctx)
		}
	}
}
