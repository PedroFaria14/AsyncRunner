// Package webhooks delivers terminal job events to public HTTPS destinations.
package webhooks

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"sync"
	"time"

	"asyncflow/queues"
	"github.com/google/uuid"
)

// Registration subscribes a destination to a terminal event.
type Registration struct {
	URL   string `json:"url"`
	Event string `json:"event"`
}

// Service holds subscriptions in memory.
type Service struct {
	mu            sync.Mutex
	subscriptions map[string][]string
	client        *http.Client
	logger        *slog.Logger
}

func publicIP(ip net.IP) bool {
	if ip == nil || !ip.IsGlobalUnicast() || ip.IsPrivate() || ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
		return false
	}
	address, ok := netip.AddrFromSlice(ip)
	if !ok {
		return false
	}
	address = address.Unmap()
	for _, reserved := range []string{"0.0.0.0/8", "100.64.0.0/10", "192.0.0.0/24", "192.0.2.0/24", "192.88.99.0/24", "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "240.0.0.0/4", "64:ff9b::/96", "64:ff9b:1::/48", "100::/64", "2001::/23", "2001:db8::/32", "2002::/16"} {
		if netip.MustParsePrefix(reserved).Contains(address) {
			return false
		}
	}
	return true
}

// New creates a bounded HTTP client that validates DNS results at connection time.
func New(logger *slog.Logger) *Service {
	transport := &http.Transport{TLSClientConfig: &tls.Config{MinVersion: tls.VersionTLS12}, DialContext: func(ctx context.Context, network, address string) (net.Conn, error) {
		host, port, err := net.SplitHostPort(address)
		if err != nil {
			return nil, err
		}
		ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
		if err != nil {
			return nil, err
		}
		if len(ips) == 0 {
			return nil, errors.New("destination has no addresses")
		}
		for _, ip := range ips {
			if !publicIP(ip.IP) {
				return nil, errors.New("destination must resolve to public addresses")
			}
		}
		return (&net.Dialer{Timeout: 3 * time.Second}).DialContext(ctx, network, net.JoinHostPort(ips[0].IP.String(), port))
	}}
	return &Service{subscriptions: make(map[string][]string), logger: logger, client: &http.Client{Timeout: 5 * time.Second, Transport: transport, CheckRedirect: func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }}}
}

// Register validates a public HTTPS URL and deduplicates subscriptions.
func (s *Service) Register(r Registration) error {
	u, err := url.Parse(r.URL)
	if err != nil || u.Scheme != "https" || u.Hostname() == "" || u.User != nil || u.Fragment != "" || (u.Port() != "" && u.Port() != "443") {
		return errors.New("use a public HTTPS URL on port 443")
	}
	if ip := net.ParseIP(u.Hostname()); ip != nil && !publicIP(ip) {
		return errors.New("private addresses are not allowed")
	}
	if r.Event != "job.completed" && r.Event != "job.failed" {
		return errors.New("event must be job.completed or job.failed")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, target := range s.subscriptions[r.Event] {
		if target == r.URL {
			return nil
		}
	}
	if len(s.subscriptions[r.Event]) >= 20 {
		return errors.New("subscription limit reached")
	}
	s.subscriptions[r.Event] = append(s.subscriptions[r.Event], r.URL)
	return nil
}

// Notify delivers once per terminal transition. Failed delivery is logged, not retried.
func (s *Service) Notify(ctx context.Context, job queues.Job) {
	event := "job." + string(job.JobStatus)
	s.mu.Lock()
	targets := append([]string(nil), s.subscriptions[event]...)
	s.mu.Unlock()
	payload, err := json.Marshal(struct {
		ID        string    `json:"event_id"`
		Name      string    `json:"event_name"`
		JobID     string    `json:"job_id"`
		Timestamp time.Time `json:"timestamp"`
	}{uuid.NewString(), event, job.ID.String(), time.Now().UTC()})
	if err != nil {
		s.logger.ErrorContext(ctx, "webhook encoding failed")
		return
	}
	for _, target := range targets {
		if ctx.Err() != nil {
			return
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, target, bytes.NewReader(payload))
		if err != nil {
			s.logger.ErrorContext(ctx, "webhook request failed", "job_id", job.ID.String())
			continue
		}
		req.Header.Set("Content-Type", "application/json")
		resp, err := s.client.Do(req)
		if err != nil {
			s.logger.WarnContext(ctx, "webhook delivery failed", "job_id", job.ID.String())
			continue
		}
		resp.Body.Close()
		s.logger.InfoContext(ctx, "webhook delivery finished", "job_id", job.ID.String(), "status_code", resp.StatusCode, "success", resp.StatusCode >= 200 && resp.StatusCode < 300)
	}
}
