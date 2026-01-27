package controller

import (
	"asyncflow/models"
	"asyncflow/queues"
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

var mu sync.Mutex
var jobs = make(map[string]*queues.Job)
var webhookMap = make(map[string][]string)

func HandleJobs(w http.ResponseWriter, r *http.Request) {
	novoJob := queues.NewJob()
	id := novoJob.ID().String()

	SaveJob(novoJob)

	go func(jobID string) {
		time.Sleep(10 * time.Second)

		UpdateJobStatus(jobID, queues.StatusProcessing)

		time.Sleep(10 * time.Second)

		UpdateJobStatus(jobID, queues.StatusCompleted)

	}(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(novoJob)
}

func SaveJob(job *queues.Job) {
	mu.Lock()
	defer mu.Unlock()
	jobs[job.ID().String()] = job
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

func UpdateJobStatus(id string, status queues.JobStatus) bool {
	mu.Lock()
	job, exists := jobs[id]
	if !exists {
		mu.Unlock()
		return false
	}
	job.JobStatus = status
	mu.Unlock()

	evento := models.Event{
		EventID:   uuid.New().String(),
		EventName: string(status),
		EventDate: time.Now(),
		EventType: "job_status_change",
		JobID:     id,
	}

	notifyJobStatusChange(id, evento)
	return true

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
