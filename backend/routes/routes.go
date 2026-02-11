// routes/routes.go
package routes

import (
	"asyncflow/controller"

	"github.com/gorilla/mux"
)

func CarregaRotas() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/jobs", controller.HandleJobs).Methods("POST", "OPTIONS")

	r.HandleFunc("/jobs", controller.GetJobsHandler).Methods("GET", "OPTIONS")

	r.HandleFunc("/jobs/{id}", controller.GetJobByID).Methods("GET", "OPTIONS")

	r.HandleFunc("/webhooks", controller.RegisterWebhookHandler).Methods("POST")
	return r

}
