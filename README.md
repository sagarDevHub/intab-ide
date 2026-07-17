# Intabide - Advanced Multi-Model Code Playground

Intabide is a high-performance, event-driven code playground environment engineered using a decoupled microservices architecture. The application enables browser-isolated sandboxed code execution, features AI-assisted automated completions powered by Gemini AI, and utilizes local request proxy routing.

## 🏗️ Architecture & Tech Stack

This project is organized as a unified Monorepo, separating core presentation layers from infrastructure execution domains:

- **Frontend (`/client`)**: Next.js / React application leveraging `@webcontainer/api` for native browser-isolated runtime code compilation and execution terminal syncs.
- **Reverse Proxy Gateway (`/services/intabide-proxy`)**: Nginx runtime container serving as a centralized ingress channel, applying pattern filtering to drop automated script traffic before hitting core compute engines.
- **AI Engine (`/services/intabide-ai-service`)**: Independent Node.js application running the Google Gemini AI library integrated with Upstash Redis cache storage keys to mitigate API usage costs.

[ Client Application ]
│
▼ (Port 80 Ingress)
[ Nginx Reverse Proxy ]
│
▼ (Internal Service Forward)
[ AI Microservice Engine ] ──► [ Upstash Redis Cache / Gemini API ]

## 🛠️ Local Development Quickstart

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Node.js](https://nodejs.org/) installed globally before initializing configurations.

### 1. Define Secret Variables

Create a `.env` file at the absolute root of this repository:

```env
GEMINI_API_KEY=your_gemini_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```
