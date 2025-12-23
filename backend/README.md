# ESG Backend

Node.js/Express backend for the ESG Reporting System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Initialize database:
   ```bash
   npm run init-db
   ```

4. Start server:
   ```bash
   npm start
   ```

## API Endpoints

- `/api/esg` - ESG data management
- `/api/reports` - Report generation
- `/api/analytics` - Analytics and insights
- `/api/compliance` - Compliance tracking
- `/api/iot` - IoT data integration

## Features

- RESTful API design
- SQLite database with audit trails
- Real-time IoT data processing
- Multi-framework report generation
- Role-based access control
- Comprehensive logging