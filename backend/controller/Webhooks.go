package controller

import (
	"asyncflow/models"
	"encoding/json"
	"net/http"
	"sync"
)

var webhookMu sync.Mutex
var webhookMaps = make(map[string][]string)

func SaveWebhookRegistration(registration models.WebhookRegistration) {
	webhookMu.Lock()
	defer webhookMu.Unlock()
	webhookMaps[registration.Event] = append(webhookMaps[registration.Event], registration.URL)
}

func RegisterWebhookHandler(w http.ResponseWriter, r *http.Request) {
	var registration models.WebhookRegistration
	err := json.NewDecoder(r.Body).Decode(&registration)
	if err != nil {
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}
	SaveWebhookRegistration(registration)

	w.WriteHeader(http.StatusCreated)
}
