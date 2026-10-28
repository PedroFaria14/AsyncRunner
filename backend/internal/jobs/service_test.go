package jobs

import (
	"asyncflow/queues"
	"errors"
	"sync"
	"testing"
)

func TestCreateValidation(t *testing.T) {
	for _, tc := range []struct {
		name     string
		priority int
	}{{"", 1}, {"   ", 1}, {"ok", 0}, {"ok", 4}} {
		if _, err := New().Create(tc.name, tc.priority); !errors.Is(err, ErrInvalid) {
			t.Fatalf("expected validation error: %v", err)
		}
	}
	s := New()
	j, err := s.Create(" task ", 2)
	if err != nil || j.Name != "task" || j.JobStatus != queues.StatusPending || j.MaxAttempts != 3 {
		t.Fatalf("unexpected job: %+v, %v", j, err)
	}
}

func TestPriorityFIFOAndSnapshots(t *testing.T) {
	s := New()
	low, _ := s.Create("low", 1)
	high, _ := s.Create("high", 3)
	second, _ := s.Create("second", 3)
	for _, want := range []string{high.ID.String(), second.ID.String(), low.ID.String()} {
		got, ok := s.Claim()
		if !ok || got.ID.String() != want {
			t.Fatalf("claim: %+v", got)
		}
	}
	if _, ok := s.Claim(); ok {
		t.Fatal("claimed processing job")
	}
	snapshot := s.List()
	snapshot[0].Name = "changed"
	got, _ := s.Get(low.ID.String())
	if got.Name != "low" {
		t.Fatal("mutable snapshot")
	}
}

func TestRetryLimit(t *testing.T) {
	s := New()
	j, _ := s.Create("retry", 1)
	for attempt := 1; attempt <= 3; attempt++ {
		claimed, ok := s.Claim()
		if !ok || claimed.Attempts != attempt {
			t.Fatal("invalid attempt")
		}
		finished, _ := s.Finish(j.ID.String(), errors.New("execution failed"))
		want := queues.StatusPending
		if attempt == 3 {
			want = queues.StatusFailed
		}
		if finished.JobStatus != want {
			t.Fatalf("got %s", finished.JobStatus)
		}
	}
	if _, ok := s.Claim(); ok {
		t.Fatal("retried terminal job")
	}
}

func TestConcurrentClaims(t *testing.T) {
	s := New()
	s.Create("once", 1)
	var wg sync.WaitGroup
	var mu sync.Mutex
	claims := 0
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, ok := s.Claim(); ok {
				mu.Lock()
				claims++
				mu.Unlock()
			}
			s.List()
		}()
	}
	wg.Wait()
	if claims != 1 {
		t.Fatalf("claims=%d", claims)
	}
}
