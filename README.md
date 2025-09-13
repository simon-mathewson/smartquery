# SmartQuery

> **⚠️ PROPRIETARY SOFTWARE - NOT OPEN SOURCE**  
> This repository contains proprietary source code. Copying, modifying, or distributing this code is not allowed. See [LICENSE](LICENSE) for full terms.

## Overview

SmartQuery is an AI-powered database management tool that enables users to connect to various database systems, execute queries, and leverage artificial intelligence for enhanced database interactions right from the browser.

## Architecture

This monorepo contains four main components:

### 🌐 **UI** (`/ui`)

- **Technology**: React 18 + TypeScript + Vite
- **Purpose**: Web-based user interface for SmartQuery
- **Features**:
  - Modern React-based dashboard
  - SQL query editor with Monaco Editor
  - Real-time query execution
  - AI-powered query assistance
  - Responsive design with Tailwind CSS
  - PWA support for offline functionality

### ☁️ **Cloud** (`/cloud`)

- **Technology**: Node.js + Express + tRPC + Prisma
- **Purpose**: Backend API and cloud services
- **Features**:
  - RESTful API with tRPC for type-safe communication
  - User authentication and authorization
  - Database connection management
  - AI integration (Google Gemini)
  - Stripe payment processing
  - Email services (AWS SES)
  - PostgreSQL database with Prisma ORM

### 🔗 **Link** (`/link`)

- **Technology**: Electron + TypeScript
- **Purpose**: Desktop application for local database connections
- **Features**:
  - Cross-platform desktop app (Windows, macOS, Linux)
  - Local database connectivity
  - SSH tunneling support
  - Background service capabilities
  - Auto-updater functionality

### 🤝 **Shared** (`/shared`)

- **Technology**: TypeScript
- **Purpose**: Shared utilities and types across all components
- **Features**:
  - Common TypeScript definitions
  - Database schema definitions
  - Shared utility functions
  - Type-safe API contracts

### ☁️ **Infrastructure** (`/cloudFormation`)

- **Technology**: AWS CloudFormation + YAML
- **Purpose**: Infrastructure as Code for AWS deployment
- **Features**:
  - Complete AWS infrastructure definitions
  - VPC, RDS, Elastic Beanstalk, and S3 configurations
  - Security groups and IAM roles

## Key Features

- **Database Management**: View and edit your data in a user-friendly interface
- **Multi-Database Support**: Connect to PostgreSQL, MySQL, SQLite, and more
- **AI-Powered Queries**: Generate and optimize SQL queries using AI
- **Advanced Security**: Encrypted credential storage and secure connections
- **Cross-Platform**: Web app, desktop PWA app, and mobile-responsive design

## Contact

For questions about this software or licensing, please contact:

- **Email**: support@smartquery.dev
- **Website**: https://about.smartquery.dev
