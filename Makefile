# WealthMaster - Quick Commands

.PHONY: dev stop setup db-setup mobile backend ai

# Start all services
dev:
	docker compose up -d postgres redis
	@echo "✅ Database & Redis started"
	@echo "Run these in separate terminals:"
	@echo "  make backend"
	@echo "  make ai"
	@echo "  make mobile"

# Stop all services
stop:
	docker compose down
	@echo "🛑 All services stopped"

# First-time setup
setup:
	docker compose up -d postgres redis
	cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init
	cd ai-engine && python -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd mobile && npm install
	@echo "✅ Setup complete! Run 'make dev' to start"

# Database commands
db-setup:
	cd backend && npx prisma migrate dev --name init

db-studio:
	cd backend && npx prisma studio

# Individual services
mobile:
	cd mobile && npx expo start

backend:
	cd backend && npm run dev

ai:
	cd ai-engine && .venv/bin/uvicorn app.main:app --reload --port 8000

# Ollama
ollama-setup:
	ollama pull mistral:7b
	@echo "✅ Mistral model downloaded"

# Health checks
health:
	@echo "Backend:" && curl -s http://localhost:3001/health | python -m json.tool 2>/dev/null || echo "❌ Not running"
	@echo "\nAI Engine:" && curl -s http://localhost:8000/health | python -m json.tool 2>/dev/null || echo "❌ Not running"
	@echo "\nOllama:" && curl -s http://localhost:11434/api/tags | python -m json.tool 2>/dev/null || echo "❌ Not running"
