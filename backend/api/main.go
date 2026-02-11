package main

import (
	"asyncflow/controller"
	"asyncflow/routes"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
)

func main() {
	r := routes.CarregaRotas()

	go controller.StartPriorityWorker()

	// Configuração de CORS
	origins := handlers.AllowedOrigins([]string{"http://localhost:5173"})
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})

	log.Println("🚀 Backend rodando na 8080 com Worker Ativo")

	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(origins, headers, methods)(r)))
}
