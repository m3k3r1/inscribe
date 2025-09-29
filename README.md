# Inscribe

AI-assisted research that turns long videos, PDFs, and documents into clean, reusable blocks of facts and quotes—ready for drafting posts, scripts, and articles.

> Built as a **Turborepo** monorepo with **pnpm**, **Next.js**, and an **API service**, with dockerized development and **OpenTelemetry** hooks for observability.

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Run Locally (pnpm)](#run-locally-pnpm)
  - [Run with Docker](#run-with-docker)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Observability](#observability)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

> TODO: Add a short loom or gif here showcasing: import YouTube URL → extraction → blocks → generate post.

- Live: _TBD_
- Loom: _TBD_

---

## Features

- **Multi-source ingestion**
  - YouTube URLs (transcripts), PDFs, and document uploads.
- **Block extraction**
  - Pull out key facts, quotes, timestamps, and citations into portable “blocks”.
- **Writing accelerators**
  - Turn blocks into outlines, posts, scripts, and threads with your voice & templates.
- **Templates**
  - Notion-style templates for tweets/threads, blog posts, YouTube scripts, show notes.
- **Multilingual**
  - End-to-end TypeScript; language prompts/templates can be localized.
- **Team-ready**
  - Monorepo packages for shared UI, configs, and types.

> Note: Some features are in progress in the codebase; this README describes the intended product and how the repo is laid out.

---

## Monorepo Structure

.
├─ apps/
│  ├─ web/           # Next.js app (frontend)
│  └─ api/           # API service (Node/TS; framework TBD)
├─ packages/
│  ├─ ui/            # Shared React UI (design system)
│  ├─ eslint-config/ # ESLint config package
│  └─ tsconfig/      # Base TS configs
├─ config/           # (Optional) shared config, env, etc.
├─ docker-compose.yaml
├─ Dockerfile.web
├─ Dockerfile.api
├─ otel-collector-config.yaml
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json



> The repo currently uses the Turborepo layout with `apps/` and `packages/`

---

## Tech Stack

- **Frontend**: Next.js (TypeScript), React
- **API**: Node.js (TypeScript)  
  - Framework: _TBD_ (NestJS/Express/Fastify)
- **Monorepo Tooling**: Turborepo + pnpm
- **AI Providers**: OpenAI / Anthropic / (optional) Mistral
- **Observability**: OpenTelemetry Collector (config provided)
- **Containerization**: Docker, `docker-compose`

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.x
- **Docker** (optional, for containerized setup)

```bash
# Install pnpm (if needed)
npm i -g pnpm
