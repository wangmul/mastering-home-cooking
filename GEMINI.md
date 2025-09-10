# Project: Mastering Home Cooking

## Project Overview

This is a Next.js web application designed to help users learn and master home cooking. The core of the application is a 52-week cooking roadmap, where users can track their progress, view weekly cooking challenges, and store their own recipes. The application uses Supabase as its backend for data storage and authentication, and is deployed on Vercel.

The frontend is built with React and Next.js, and the backend is a set of serverless functions deployed on Vercel that interact with the Supabase database.

## Building and Running

### Prerequisites

- Node.js and npm
- A Supabase project

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure environment variables:**
    Copy the `.env.example` file to `.env.local` and fill in the values from your Supabase project.
    ```bash
    cp .env.example .env.local
    ```
    You will need to set the following variables:
    - `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The `anon` key for your Supabase project.
    - `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` key for your Supabase project.
    - `ALLOWED_ADMIN_EMAILS`: A comma-separated list of emails that are allowed to access the admin UI.

3.  **Set up the database:**
    Run the SQL scripts in the `db` directory in your Supabase SQL editor.
    - `db/schema.sql`: Sets up the basic `pages` table.
    - `db/plan.sql`: Sets up the `weeks`, `progress`, and `recipes` tables for the 52-week plan.

4.  **Seed the 52-week plan (optional):**
    To seed the 52-week plan with the provided CSV file, run the following command:
    ```bash
    npm run import:weeks
    ```

### Running the application

-   **Development:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

-   **Production:**
    ```bash
    npm run build
    npm run start
    ```

### Testing

There are no explicit test commands defined in `package.json`. However, the project uses ESLint for linting.
```bash
npm run lint
```

## Development Conventions

-   The project uses TypeScript.
-   Styling is done with CSS, with a separate stylesheet for the plan page (`public/plan/style.css`).
-   The application uses Supabase for authentication and database storage.
-   API routes are located in `src/app/api`.
-   The main application pages are in `src/app`.
-   The 52-week plan feature is implemented in `src/app/plan/page.tsx`.
-   Database schemas are located in the `db` directory.
-   The `tools` directory contains scripts for interacting with the database.
