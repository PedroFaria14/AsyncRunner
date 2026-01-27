package models

import "time"

type Event struct {
	EventID   string    `json:"event_id"`
	EventName string    `json:"event_name"`
	EventDate time.Time `json:"timestamp"`
	EventType string    `json:"event_type"`
	JobID     string    `json:"job_id"`
}

type WebhookRegistration struct {
	URL   string `json:"url"`
	Event string `json:"event"`
}
