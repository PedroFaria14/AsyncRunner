package models

import (
	"time"

	"asyncflow/queues"
)

type JobStatus = queues.JobStatus

const (
	StatusPending    = queues.StatusPending
	StatusProcessing = queues.StatusProcessing
	StatusCompleted  = queues.StatusCompleted
	StatusFailed     = queues.StatusFailed
)

type Event struct {
	EventID   string    `json:"event_id"`
	EventName string    `json:"event_name"`
	EventDate time.Time `json:"timestamp"`
	EventType string    `json:"event_type"`
	JobID     string    `json:"job_id"`
	Priority  int       `json:"priority"`
}

type WebhookRegistration struct {
	URL   string `json:"url"`
	Event string `json:"event"`
}

type Job = queues.Job

func NewJob(name string, priority int) *Job {
	return queues.NewJob(name, priority)
}
