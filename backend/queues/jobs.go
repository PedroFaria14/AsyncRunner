package queues

import (
	"time"

	"github.com/google/uuid"
)

type JobStatus string

const (
	StatusPending    JobStatus = "pending"
	StatusProcessing JobStatus = "processing"
	StatusCompleted  JobStatus = "completed"
	StatusFailed     JobStatus = "failed"
)

type Job struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	JobStatus   JobStatus  `json:"status"`
	Priority    int        `json:"priority"`
	CreatedAt   time.Time  `json:"created_at"`
	Attempts    int        `json:"attempts"`
	MaxAttempts int        `json:"max_attempts"`
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`
}

func NewJob(name string, priority int) *Job {
	return &Job{
		ID:          uuid.New(),
		Name:        name,
		JobStatus:   StatusPending,
		Priority:    priority,
		CreatedAt:   time.Now(),
		Attempts:    0,
		MaxAttempts: 3,
	}
}
