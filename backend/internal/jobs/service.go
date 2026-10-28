// Package jobs owns job state and scheduling rules.
package jobs

import (
	"errors"
	"sort"
	"strings"
	"sync"

	"asyncflow/queues"
)

// ErrInvalid identifies invalid job input.
var ErrInvalid = errors.New("name must contain 1-200 characters and priority must be 1-3")

// Service stores jobs in memory; callers only receive value snapshots.
type Service struct {
	mu    sync.Mutex
	jobs  map[string]queues.Job
	order []string
}

// New creates an isolated job service.
func New() *Service { return &Service{jobs: make(map[string]queues.Job)} }

// Create validates and stores a pending job.
func (s *Service) Create(name string, priority int) (queues.Job, error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) > 200 || priority < 1 || priority > 3 {
		return queues.Job{}, ErrInvalid
	}
	job := *queues.NewJob(name, priority)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[job.ID.String()] = job
	s.order = append(s.order, job.ID.String())
	return job, nil
}

// List returns ordered snapshots, never the internal map.
func (s *Service) List() []queues.Job {
	s.mu.Lock()
	defer s.mu.Unlock()
	result := make([]queues.Job, 0, len(s.jobs))
	for _, id := range s.order {
		j := s.jobs[id]
		result = append(result, j)
	}
	sort.SliceStable(result, func(i, j int) bool { return result[i].CreatedAt.Before(result[j].CreatedAt) })
	return result
}

// Get returns a job snapshot.
func (s *Service) Get(id string) (queues.Job, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	j, ok := s.jobs[id]
	return j, ok
}

// Claim atomically selects the highest priority pending job, FIFO on ties.
func (s *Service) Claim() (queues.Job, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var selected queues.Job
	found := false
	for _, id := range s.order {
		j := s.jobs[id]
		if j.JobStatus != queues.StatusPending {
			continue
		}
		if !found || j.Priority > selected.Priority || (j.Priority == selected.Priority && j.CreatedAt.Before(selected.CreatedAt)) {
			selected = j
			found = true
		}
	}
	if !found {
		return queues.Job{}, false
	}
	selected.JobStatus = queues.StatusProcessing
	selected.Attempts++
	s.jobs[selected.ID.String()] = selected
	return selected, true
}

// Finish transitions a claimed job to a terminal state or back to pending.
func (s *Service) Finish(id string, executionErr error) (queues.Job, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	j, ok := s.jobs[id]
	if !ok || j.JobStatus != queues.StatusProcessing {
		return queues.Job{}, false
	}
	j.JobStatus = queues.StatusCompleted
	if executionErr != nil {
		j.JobStatus = queues.StatusPending
		if j.Attempts >= j.MaxAttempts {
			j.JobStatus = queues.StatusFailed
		}
	}
	s.jobs[id] = j
	return j, true
}
