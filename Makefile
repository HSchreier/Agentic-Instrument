.PHONY: build generate send devices clean help

help:
	@echo "Rhythm Wolf MIDI Toolkit"
	@echo ""
	@echo "Commands:"
	@echo "  make build          Build Docker image"
	@echo "  make devices        List MIDI devices"
	@echo "  make generate       Generate a pattern and print JSON"
	@echo "  make send           Send pattern to Rhythm Wolf (interactive)"
	@echo "  make generate-file  Generate and save pattern to file"
	@echo "  make clean          Remove Docker image"

build:
	docker-compose build

devices:
	docker-compose run --rm rhythm-wolf devices

generate:
	@docker-compose run --rm rhythm-wolf generate \
		--style techno \
		--tempo 128 \
		--template four_on_the_floor

generate-file:
	@mkdir -p patterns
	@docker-compose run --rm rhythm-wolf generate \
		--style techno \
		--tempo 128 \
		--output patterns/pattern_$(shell date +%s).json

send:
	@docker-compose run --rm -it rhythm-wolf send \
		--style techno \
		--tempo 128

clean:
	docker-compose down
	docker rmi rhythm-wolf:latest || true

.DEFAULT_GOAL := help
