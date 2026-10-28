package worker

import (
	"asyncflow/internal/jobs"
	"asyncflow/queues"
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"
	"time"
)

func TestStepCompletesAndNotifies(t *testing.T) {
	s := jobs.New()
	j, _ := s.Create("test", 1)
	notifications := 0
	w := Worker{Jobs: s, Logger: slog.New(slog.NewJSONHandler(io.Discard, nil)), Execute: func(context.Context, queues.Job) error { return nil }, Notify: func(_ context.Context, j queues.Job) {
		notifications++
		if j.JobStatus != queues.StatusCompleted {
			t.Fatal("non terminal event")
		}
	}}
	if !w.Step(context.Background()) || w.Step(context.Background()) {
		t.Fatal("invalid step result")
	}
	got, _ := s.Get(j.ID.String())
	if got.Attempts != 1 || notifications != 1 {
		t.Fatal("unexpected completion")
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if w.Step(ctx) {
		t.Fatal("processed after cancellation")
	}
}

func TestFailureOnlyNotifiesAfterFinalAttempt(t *testing.T) {
	s := jobs.New()
	s.Create("failure", 1)
	notifications := 0
	w := Worker{Jobs: s, Logger: slog.New(slog.NewJSONHandler(io.Discard, nil)), Execute: func(context.Context, queues.Job) error { return errors.New("executor unavailable") }, Notify: func(_ context.Context, j queues.Job) {
		notifications++
		if j.JobStatus != queues.StatusFailed {
			t.Fatal("non terminal failure")
		}
	}}
	for attempt := 0; attempt < 3; attempt++ {
		if !w.Step(context.Background()) {
			t.Fatal("missing attempt")
		}
		if attempt < 2 && notifications != 0 {
			t.Fatal("premature notification")
		}
	}
	if notifications != 1 {
		t.Fatalf("notifications=%d", notifications)
	}
}

func TestRunStopsOnCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	w := Worker{Interval: time.Hour}
	done := make(chan struct{})
	go func() { defer close(done); w.Run(ctx) }()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("worker did not stop")
	}
}
