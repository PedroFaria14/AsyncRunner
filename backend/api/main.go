package main

import (
	"asyncflow/routes"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
)

func main() {
	r := routes.CarregaRotas()

	origins := handlers.AllowedOrigins([]string{"http://localhost:5173"})
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})

	log.Println("🚀 Backend rodando na 8080")

	http.ListenAndServe(":8080", handlers.CORS(origins, headers, methods)(r))
}
