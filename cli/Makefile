BINARY := devai
BUILD_DIR := .

.PHONY: build install clean lint help

## build: compile the CLI binary into the current directory
build:
	go build -o $(BUILD_DIR)/$(BINARY) .

## install: compile and install the binary to $GOPATH/bin
install:
	go install .

## clean: remove the compiled binary
clean:
	rm -f $(BUILD_DIR)/$(BINARY)

## lint: run go vet and static analysis
lint:
	go vet ./...

## tidy: tidy go modules
tidy:
	go mod tidy

## help: list available make targets
help:
	@grep -E '^##' Makefile | sed 's/## /  /'
