package main

import (
	"asyncflow/routes"
	"log"
	"net/http"
)

func main() {
	r := routes.CarregaRotas()

	log.Println("🚀 AsyncRunner backend running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
