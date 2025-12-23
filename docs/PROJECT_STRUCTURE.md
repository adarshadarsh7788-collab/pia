# Project Structure Guide

## Overview
This document outlines the organized structure of the ESG Reporting System project.

## Directory Structure

```
pia/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Database and app configuration
│   ├── controllers/           # Request handlers
│   ├── database/             # Database schemas and migrations
│   ├── integrations/         # External system connectors
│   ├── middleware/           # Express middleware
│   ├── models/               # Data models
│   ├── reports/              # Report generation logic
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   ├── .env                  # Environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
│
├── frontend/                   # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── api/              # API client functions
│   │   ├── calculators/      # ESG calculation modules
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React context providers
│   │   ├── integrations/     # Frontend integrations
│   │   ├── modules/          # Feature modules
│   │   ├── services/         # Frontend services
│   │   ├── utils/            # Utility functions
│   │   └── App.js            # Main app component
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
│
├── docs/                       # Documentation
│   ├── enhancements/         # Enhancement proposals
│   ├── api/                  # API documentation
│   ├── user-guides/          # User manuals
│   └── technical/            # Technical documentation
│
├── scripts/                    # Utility scripts
│   ├── start-system.bat      # Start full system
│   ├── build-production.bat  # Production build
│   └── database/             # Database scripts
│
├── tests/                      # Test files
│   ├── backend/              # Backend tests
│   ├── frontend/             # Frontend tests
│   └── integration/          # Integration tests
│
├── config/                     # Global configuration
│   ├── .env.example          # Environment template
│   └── deployment/           # Deployment configs
│
├── package.json               # Root package.json
└── README.md                  # Main project README
```

## Key Features by Directory

### Backend (`/backend`)
- RESTful API with Express.js
- SQLite database with comprehensive schemas
- Real-time IoT data processing
- Multi-framework report generation (GRI, SASB, TCFD, BRSR)
- Role-based access control
- Audit trail system

### Frontend (`/frontend`)
- Modern React 18 application
- Responsive design with Tailwind CSS
- Interactive charts and dashboards
- Real-time data visualization
- Multi-role user interfaces
- Professional report previews

### Documentation (`/docs`)
- API documentation
- User guides and manuals
- Technical specifications
- Enhancement proposals

### Scripts (`/scripts`)
- Development utilities
- Build and deployment scripts
- Database management tools
- Testing automation

## Getting Started

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Configure Environment**
   ```bash
   cp config/.env.example config/.env
   # Edit configuration as needed
   ```

3. **Start Development**
   ```bash
   npm start
   # Or use: scripts/start-system.bat
   ```

## Development Workflow

1. Backend development: Work in `/backend` directory
2. Frontend development: Work in `/frontend` directory  
3. Documentation: Update `/docs` as needed
4. Testing: Use `/tests` for all test files
5. Scripts: Add utilities to `/scripts`

## Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Configure production environment
3. Deploy backend to server
4. Serve frontend build files
5. Configure reverse proxy if needed