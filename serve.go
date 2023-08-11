package main

import (
	"log"
	"net/http"
	"os"
)

type HTMLDir struct {
	d http.Dir
}

func (h HTMLDir) Open(name string) (http.File, error) {
	f, err := h.d.Open(name)
	if os.IsNotExist(err) {
		if f, err := h.d.Open(name + ".html"); err == nil {
			return f, nil
		}
	}
	return f, err
}

func serve() {
	fs := http.FileServer(HTMLDir{http.Dir("./rendered")})
	http.Handle("/", fs)
	if err := http.ListenAndServe("localhost:1234", nil); err != nil {
		log.Fatal(err)
	}
}