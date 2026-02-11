package controller

import (
	"asyncflow/models"
	"asyncflow/queues"
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
)

var mu sync.Mutex
var jobs = make(map[string]*queues.Job)

func HandleJobs(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name     string `json:"name"`
		Priority int    `json:"priority"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		log.Printf("❌ Erro ao decodificar: %v", err)
		http.Error(w, "JSON inválido", 400)
		return
	}

	novoJob := queues.NewJob(body.Name, body.Priority)

	SaveJob(novoJob)

	log.Printf("📥 Job '%s' (Prio: %d) adicionado à fila.", body.Name, body.Priority)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(novoJob)
}

func SaveJob(job *queues.Job) {
	mu.Lock()
	defer mu.Unlock()

	jobs[job.ID.String()] = job
}

func ListJobs() map[string]*queues.Job {
	mu.Lock()
	defer mu.Unlock()
	return jobs
}

func GetJob(id string) (*queues.Job, bool) {
	mu.Lock()
	defer mu.Unlock()
	job, exists := jobs[id]
	return job, exists
}
func GetJobByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	job, exists := GetJob(id)
	if !exists {
		http.Error(w, "Job não encontrado", http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(job); err != nil {
		http.Error(w, "Erro ao processar job", 500)
	}
}

func UpdateJobStatus(id string, status queues.JobStatus) {
	mu.Lock()
	defer mu.Unlock()
	if job, ok := jobs[id]; ok {
		job.JobStatus = status
	}
}

func DeleteJob(id string) bool {
	mu.Lock()
	defer mu.Unlock()
	_, exists := jobs[id]
	if !exists {
		return false
	}
	delete(jobs, id)
	return true
}

func GetJobsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	mu.Lock()
	lista := make([]*queues.Job, 0)
	for _, job := range jobs {
		lista = append(lista, job)
	}
	mu.Unlock()

	json.NewEncoder(w).Encode(lista)
}

func notifyJobStatusChange(jobID string, evento models.Event) {
	webhookMu.Lock()
	assinantes := webhookMaps[evento.EventName]
	webhookMu.Unlock()

	for _, url := range assinantes {
		go func(targetURL string, payload models.Event) {
			jsonPayload, err := json.Marshal(payload)
			if err != nil {
				log.Printf("❌ Erro ao converter evento para JSON: %v", err)
				return
			}

			resp, err := http.Post(targetURL, "application/json", bytes.NewBuffer(jsonPayload))
			if err != nil {
				log.Printf("⚠️ Falha ao enviar Webhook para %s: %v", targetURL, err)
				return
			}

			defer resp.Body.Close()

			log.Printf("✅ Webhook enviado com sucesso para %s | Status: %s", targetURL, resp.Status)

		}(url, evento)
	}
}
