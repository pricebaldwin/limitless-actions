# Limitless Data Ingestor

> [!WARNING]
> This is an example project and not intended for production use. Proceed with caution.

A TypeScript-based application for ingesting and managing data from the Limitless API. This service fetches lifelogs from the Limitless API on a scheduled basis, stores them in a database, and provides a REST API and React dashboard for data visualization.

## Features

-   Scheduled data ingestion from Limitless API
-   SQLite database storage (extensible to other database types)
-   REST API for data access and management
-   React-based dashboard for data visualization

## Prerequisites

-   Node.js (v14 or later)
-   npm or yarn
-   A Limitless API key

## Project Structure

```
/
├── client/                # React client application
├── src/
│   ├── api/              # API interaction code
│   ├── db/               # Database adapters and initialization
│   ├── server/           # Express server and API routes
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Main application entry point
├── .env                  # Environment variables
└── package.json          # Project dependencies and scripts
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/pricebaldwin/limitless-actions.git
cd limitless
```

2. Install dependencies for the server:

```bash
npm install
```

3. Install dependencies for the client:

```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following content:

```
LIMITLESS_API_KEY=your_api_key_here
DB_TYPE=sqlite
DB_PATH=./data/limitless.db
PORT=3000
ENABLE_SERVER=true
INGESTION_SCHEDULE=*/30 * * * *
```

Replace `your_api_key_here` with your actual Limitless API key.

## Running the Application

### Development Mode

1. Start the server:

```bash
npm run dev
```

This will start the server with ts-node, which compiles TypeScript on the fly.

2. In a separate terminal, start the client:

```bash
cd client
npm start
```

The client will be available at http://localhost:3000 (or another port if 3000 is already in use).

### Production Mode

1. Build the server:

```bash
npm run build
```

2. Build the client:

```bash
cd client
npm run build
cd ..
```

3. Start the production server:

```bash
npm start
```

## API Endpoints

-   `GET /api/status` - Get service status and statistics
-   `GET /api/lifelogs` - Get lifelogs with pagination
-   `POST /api/ingest` - Trigger manual data ingestion

## Configuration

The application can be configured using environment variables in the `.env` file:

-   `LIMITLESS_API_KEY` - Your Limitless API key
-   `DB_TYPE` - Database type (currently only 'sqlite' is supported)
-   `DB_PATH` - Path to the SQLite database file
-   `PORT` - Port for the HTTP server
-   `ENABLE_SERVER` - Set to 'true' to enable the HTTP server
-   `INGESTION_SCHEDULE` - Cron schedule for data ingestion

## Development

### Scripts

-   `npm run dev` - Start the development server
-   `npm run build` - Build the server for production
-   `npm start` - Start the production server
-   `npm test` - Run tests

## License

MIT
