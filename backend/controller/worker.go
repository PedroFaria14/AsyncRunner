package controller

import (
	"asyncflow/models"
	"math/rand"
	"time"
)

func StartJobWorker() {
	for {
		models.JobMutex.Lock()
		var target *models.Job
		for i := range models.GlobalJobs {
			if models.GlobalJobs[i].Status == "PENDING" {
				target = &models.GlobalJobs[i]
				break
			}
		}
		models.JobMutex.Unlock()

		if target != nil {
			process(target)
		}
		time.Sleep(1 * time.Second)
	}
}

func process(job *models.Job) {
	models.JobMutex.Lock()
	job.Status = "RUNNING"
	models.JobMutex.Unlock()

	time.Sleep(time.Duration(rand.Intn(6)+3) * time.Second)

	models.JobMutex.Lock()
	if rand.Float32() < 0.2 {
		job.Status = "FAILED"
	} else {
		job.Status = "COMPLETED"
	}
	models.JobMutex.Unlock()
}
