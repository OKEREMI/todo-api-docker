# Todo API (Dockerized)

A simple Todo List REST API built with Node.js, Express, and SQLite (via better-sqlite3),
packaged as a Docker image. Runs as a non-root user, includes a health check, and
persists data through a Docker volume.

## Routes

| Method | Route         | Description         |
|--------|---------------|----------------------|
| GET    | /todos        | List all todos       |
| POST   | /todos        | Create a new todo    |
| GET    | /todos/:id    | Get one todo by id   |
| PUT    | /todos/:id    | Update a todo        |
| DELETE | /todos/:id    | Delete a todo         |
| GET    | /health       | Health check status  |

A simple browser interface is also served at `/`.

## Build the image

```bash
docker build -t todo-api .
```

## Run the container

```bash
docker run -d --name todo-api \
  --restart unless-stopped \
  -p 3000:3000 \
  -e DB_PATH=/data/todos.db \
  -v todos-data:/data \
  todo-api:latest
```

### What each flag does

- `-d` runs the container in the background.
- `--name todo-api` names the container for easy reference.
- `--restart unless-stopped` restarts the container automatically on crash or reboot.
- `-p 3000:3000` maps port 3000 on the host to port 3000 in the container.
- `-e DB_PATH=/data/todos.db` tells the app where to create its database file.
- `-v todos-data:/data` persists the database in a named Docker volume, so data
  survives even if the container is removed and recreated.

## Verify it's running

```bash
docker ps
curl http://localhost:3000/health
```

`docker ps` should show status `Up` and `healthy`. The health check hits `/health`
every 30 seconds.

## Security notes

- The container runs as a dedicated non-root user (`appuser`), not root.
- The `/data` directory is explicitly owned by `appuser` before the app starts,
  so it has permission to create and write the database file there.
