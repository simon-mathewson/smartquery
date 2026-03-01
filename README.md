# SmartQuery

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**SmartQuery** is an AI-powered database management tool. Connect to PostgreSQL, MySQL, SQLite, and more—run queries, explore data, and use AI to help write and optimize SQL. It runs locally: your credentials and data stay on your device.

- **GitHub**: [github.com/simon-mathewson/smartquery](https://github.com/simon-mathewson/smartquery)
- **Website**: [about.smartquery.dev](https://about.smartquery.dev)

## Overview

This monorepo contains the main pieces of SmartQuery:

### 🌐 **UI** (`/ui`)

- **Stack**: React 18 + TypeScript + Vite
- Web UI: SQL editor (Monaco), query execution, AI assistance, charts
- Tailwind CSS, PWA support

### 🖥️ **Desktop** (`/desktop`)

- **Stack**: Electron + TypeScript
- Cross-platform app (Windows, macOS, Linux) for local database connections
- SSH tunneling, auto-updates

### 📱 **Native** (`/native`)

- **Stack**: React Native + Expo
- iOS (and Android) app for on-the-go database access

### 📦 **Shared** (`/shared`)

- Shared TypeScript types and utilities used across UI, desktop, and native

## Key features

- **Multi-database**: PostgreSQL, MySQL, SQLite, and more
- **AI-assisted SQL**: Generate and refine queries with AI (bring your own API key)
- **Local-first**: No account required; credentials and data stay on your machine
- **Cross-platform**: Web, desktop app, and mobile

## License

This project is open source under the [MIT License](LICENSE).

Copyright (c) 2025 Simon Mathewson
