ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: help
help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Run
server-run: ## Run server
	go run cmd/server/main.go

bot-run: ## Run bot
	go run cmd/tgbot/main.go

compose-up: ## Launch full service in docker-compose
	docker compose up --build -d && docker compose logs -f

compose-down: ## Compose down
	docker compose down

##@ Database
db-compose-up: ## Launch database+adminer from docker-compose
	docker compose up database adminer --build -d && docker compose logs -f

DB_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable

db-migrate-up: migrate-install ## Migrate up
	$(MIGRATE) -database $(DB_URL) -path migrations up

db-migrate-down: migrate-install ## Migrate down
	$(MIGRATE) -database $(DB_URL) -path migrations down


##@ Tests
test: ## Run all tests
	go test ./tests/...

test-events: ## Run events tests only
	go test ./tests/events

test-registrations: ## Run registrations tests only
	go test ./tests/registrations

test-permissions: ## Run permissions tests only
	go test ./tests/events -run TestCreateGamePermissions
	go test ./tests/events -run TestCreateTournamentPermissions
	go test ./tests/events -run TestUpdateGamePermissions
	go test ./tests/events -run TestCreateTrainingPermissions

test-deletion: ## Run deletion tests only
	go test ./tests/events -run TestEventDeletion

test-game-registration: ## Run game registration tests only
	go test ./tests/registrations -run TestGameRegistrationFlow

test-tournament-registration: ## Run tournament registration tests only
	go test ./tests/registrations -run TestTournamentRegistrationFlow

test-verbose: ## Run all tests with verbose output
	go test -v ./tests/...

test-short: ## Run tests with short flag (skip long-running tests)
	go test -short ./tests/...

test-coverage: ## Run tests with coverage report
	go test -coverprofile=coverage.out ./tests/...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-clean: ## Clean test coverage files
	rm -f coverage.out coverage.html


##@ Tools
GOLANGCI_LINT = $(shell pwd)/bin/golangci-lint
golangci-lint-install:
	$(call go-get-tool,$(GOLANGCI_LINT),github.com/golangci/golangci-lint/cmd/golangci-lint@v1.63.4)

SWAG = $(shell pwd)/bin/swag
swag-install:
	$(call go-get-tool,$(SWAG),github.com/swaggo/swag/cmd/swag@v1.16.3)

MIGRATE = $(shell pwd)/bin/migrate
migrate-install:
	$(call go-get-tool,$(MIGRATE),-tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.1)

lint: golangci-lint-install ## Lint (github.com/golangci/golangci-lint)
	$(GOLANGCI_LINT) run

lint-fix: golangci-lint-install ## Lint fix
	$(GOLANGCI_LINT) run --fix

swag: swag-install ## Generate swag documentation (github.com/swaggo/swag)
	$(SWAG) init -g cmd/server/main.go -o docs

PROJECT_DIR := $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))
define go-get-tool
@[ -f $(1) ] || { \
set -e ;\
TMP_DIR=$$(mktemp -d) ;\
cd $$TMP_DIR ;\
go mod init tmp ;\
echo "Downloading $(2)" ;\
GOBIN=$(PROJECT_DIR)/bin go install $(2) ;\
rm -rf $$TMP_DIR ;\
}
endef
