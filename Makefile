.PHONY: install dev build lint test check docker

install:
	npm ci
	npx playwright install chromium

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint
	npm run format:check
	npm run lint:html
	npm run typecheck

test: build
	npm test

check:
	npm run check

docker:
	docker compose up --build
