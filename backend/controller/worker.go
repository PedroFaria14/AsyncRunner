package controller

import (
	"asyncflow/queues"
	"log"
	"math/rand"
	"time"
)

func StartPriorityWorker() {
	for {
		mu.Lock()
		var nextJob *queues.Job
		highestPrio := -1

		for _, job := range jobs {
			if job.JobStatus == queues.StatusPending {
				if job.Priority > highestPrio {
					highestPrio = job.Priority
					nextJob = job
				}
			}
		}
		mu.Unlock()

		if nextJob != nil {
			processar(nextJob)
		} else {
			time.Sleep(2 * time.Second)
		}
	}
}

func processar(job *queues.Job) {
	idStr := job.ID.String()

	UpdateJobStatus(idStr, queues.StatusProcessing)

	mu.Lock()
	job.Attempts++
	mu.Unlock()

	log.Printf("🔨 Processando: %s (Tentativa %d/%d)", job.Name, job.Attempts, job.MaxAttempts)
	time.Sleep(5 * time.Second)

	if rand.Float32() < 0.3 {
		log.Printf("❌ Falha no Job: %s", job.Name)
		if job.Attempts < job.MaxAttempts {
			UpdateJobStatus(idStr, queues.StatusPending)
		} else {
			UpdateJobStatus(idStr, queues.StatusFailed)
		}
		return
	}

	UpdateJobStatus(idStr, queues.StatusCompleted)
	log.Printf("✅ Sucesso: %s", job.Name)
}
