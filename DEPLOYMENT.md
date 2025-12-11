# Deployment Guide (Windows Server)

This guide describes how to deploy the Instagram Auto Poster application on a Windows Server environment.

## Prerequisites

1.  **Node.js**: Install the latest LTS version (v20+ recommended).
2.  **PostgreSQL**: Install and run PostgreSQL. Create a database named `instagram_poster`.
3.  **Redis**: Install and run Redis (required for job queues).
4.  **Git**: Install Git to clone the repository.

## Installation

1.  **Clone the Repository**:
    ```powershell
    git clone <repository_url>
    cd gravity
    ```

2.  **Install Dependencies**:
    ```powershell
    npm install
    ```

3.  **Environment Configuration**:
    - Copy `.env.example` to `.env`.
    - Update the following variables in `.env`:
        - `DATABASE_URL`: Your PostgreSQL connection string.
        - `REDIS_HOST` & `REDIS_PORT`: Redis connection details.
        - `JWT_SECRET`: A strong secret key.
        - `ENCRYPTION_KEY`: A 32-character string for encryption.
        - API Keys (Instagram, DeepSeek, Cloudinary).

4.  **Database Setup**:
    ```powershell
    npm run migrate
    npm run seed
    ```

5.  **Build the Application**:
    ```powershell
    npm run build
    ```
    This command compiles the TypeScript backend and builds the React frontend.

## Running with PM2

We use PM2 to manage the application processes (Server and Worker).

1.  **Install PM2 Globally**:
    ```powershell
    npm install -g pm2
    ```

2.  **Start the Application**:
    ```powershell
    npm run start:prod
    ```
    This command executes `pm2 start ecosystem.config.js`, which starts:
    - `gravity-server`: The backend API and frontend file server.
    - `gravity-worker`: The background worker for publishing posts.

3.  **Monitoring**:
    - View status: `pm2 status`
    - View logs: `pm2 logs`
    - Monitor resources: `pm2 monit`

4.  **Persistence (Startup on Boot)**:
    To ensure the app starts when the server reboots, install `pm2-windows-service`:
    ```powershell
    npm install -g pm2-windows-service
    pm2-service-install
    ```

## Troubleshooting

- **Port Conflicts**: Ensure port 3000 is free. You can change the port in `.env` and `ecosystem.config.js`.
- **Database Connection**: Check `DATABASE_URL` and ensure PostgreSQL service is running.
- **Redis Connection**: Ensure Redis service is running.
