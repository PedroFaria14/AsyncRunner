package webhooks

import (
	"asyncflow/queues"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"testing"
)

func TestRegister(t *testing.T) {
	s := New(slog.New(slog.NewJSONHandler(io.Discard, nil)))
	for _, u := range []string{"http://example.com", "https://127.0.0.1", "https://10.0.0.1", "https://[::1]", "https://user:pass@example.com", "https://example.com:8080"} {
		if s.Register(Registration{u, "job.completed"}) == nil {
			t.Fatalf("accepted unsafe URL %s", u)
		}
	}
	r := Registration{"https://example.com/events", "job.completed"}
	if err := s.Register(r); err != nil {
		t.Fatal(err)
	}
	s.Register(r)
	if len(s.subscriptions[r.Event]) != 1 {
		t.Fatal("duplicate subscription")
	}
	if s.Register(Registration{r.URL, "invalid"}) == nil {
		t.Fatal("invalid event accepted")
	}
}

type transportFunc func(*http.Request) (*http.Response, error)

func (f transportFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestNotifySendsTerminalPayloadAndLogsNonSuccess(t *testing.T) {
	var logs bytes.Buffer
	s := New(slog.New(slog.NewJSONHandler(&logs, nil)))
	s.Register(Registration{"https://example.com/events", "job.completed"})
	calls := 0
	s.client = &http.Client{Transport: transportFunc(func(r *http.Request) (*http.Response, error) {
		calls++
		if r.Method != "POST" || r.Header.Get("Content-Type") != "application/json" {
			t.Fatal("invalid webhook request")
		}
		var event map[string]string
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			t.Fatal(err)
		}
		if event["event_id"] == "" || event["event_name"] != "job.completed" || event["job_id"] == "" {
			t.Fatalf("invalid event: %v", event)
		}
		return &http.Response{StatusCode: 503, Body: io.NopCloser(strings.NewReader("unavailable"))}, nil
	})}
	job := queues.NewJob("private job name", 1)
	job.JobStatus = queues.StatusCompleted
	s.Notify(context.Background(), *job)
	if calls != 1 || !strings.Contains(logs.String(), `"success":false`) || strings.Contains(logs.String(), "example.com") || strings.Contains(logs.String(), job.Name) {
		t.Fatalf("unexpected delivery logs: %s", logs.String())
	}
}

func TestTransportRejectsPrivateDNS(t *testing.T) {
	s := New(slog.New(slog.NewJSONHandler(io.Discard, nil)))
	transport := s.client.Transport.(*http.Transport)
	conn, err := transport.DialContext(context.Background(), "tcp", "127.0.0.1:443")
	if conn != nil {
		conn.Close()
		t.Fatal("private destination connected")
	}
	if err == nil {
		t.Fatal("private destination accepted")
	}
}
