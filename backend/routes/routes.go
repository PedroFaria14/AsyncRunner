// routes/routes.go
package routes

import (
	"asyncflow/controller"

	"github.com/gorilla/mux"
)

func CarregaRotas() *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/jobs", controller.HandleJobs).Methods("POST", "GET")
	r.HandleFunc("/jobs/{id}", controller.GetJobByID).Methods("GET")
	r.HandleFunc("/webhooks", controller.RegisterWebhookHandler).Methods("POST")
	return r

}
