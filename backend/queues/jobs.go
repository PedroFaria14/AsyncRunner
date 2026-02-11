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
	Id          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	JobStatus   JobStatus  `json:"status"`
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`
}

func (j *Job) ID() uuid.UUID {
	return j.Id
}

func NewJob(name string) *Job {
	return &Job{
		Id:        uuid.New(),
		Name:      name,
		JobStatus: StatusPending,
	}
}
