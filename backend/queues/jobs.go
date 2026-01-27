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
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`

	Id        uuid.UUID `json:"id"`
	JobStatus JobStatus `json:"status"`
}

func (j *Job) ID() uuid.UUID {
	return j.Id
}

func NewJob() *Job {
	return &Job{
		Id:        uuid.New(),
		JobStatus: StatusPending,
	}
}
