---
title: 'Day 1 - Build a Minimal Docker Image'
day: 1
excerpt: 'Learn to create the smallest possible Docker image for a Python or Node.js application. Optimize for size, security, and performance.'
description: 'Create a minimal Docker image under 25MB using multi-stage builds, Alpine Linux, and best practices for containerization.'
publishedAt: '2025-12-01T00:00:00Z'
updatedAt: '2025-12-01T00:00:00Z'
difficulty: 'Beginner'
category: 'Docker'
tags:
  - Docker
  - Containerization
  - Optimization
  - Alpine
---

## Description

You're tasked with containerizing a small application, but your manager is concerned about image size and security. Large images slow down deployments, cost more to store, and have larger attack surfaces. Your goal is to create the smallest, most efficient Docker image possible.

## Task

Create the smallest working Docker image you can for a tiny Python or Node.js application.

**Requirements:**
- Image must be under 25MB
- Application must run successfully
- Use multi-stage builds
- Use Alpine Linux base images
- Remove unnecessary dependencies

## Target

- **Image Size**: Under 25MB
- **Startup Time**: Under 2 seconds
- **Security**: Minimal attack surface with Alpine base

## Sample App

### Python Example (app.py)

```python
from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Hello from Advent of DevOps!')

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), SimpleHandler)
    print('Server running on port 8000...')
    server.serve_forever()
```

### Node.js Example (app.js)

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Advent of DevOps!');
});

server.listen(8000, '0.0.0.0', () => {
  console.log('Server running on port 8000...');
});
```

## Solution

### Optimized Dockerfile (Python)

```dockerfile
# Multi-stage build
FROM python:3.12-alpine AS builder

# Create app directory
WORKDIR /app

# Copy application
COPY app.py .

# Final stage
FROM python:3.12-alpine

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder /app/app.py .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "app.py"]
```

### Optimized Dockerfile (Node.js)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY app.js .

# Final stage
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

# Copy application
COPY --from=builder /app/app.js .

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["node", "app.js"]
```

### Build and Test

```bash
# Build the image
docker build -t advent-day1:latest .

# Check image size
docker images advent-day1:latest

# Run the container
docker run -p 8000:8000 advent-day1:latest

# Test the application
curl http://localhost:8000
```

## Explanation

### Why This Matters

Image size directly impacts:
- **Deployment Speed**: Smaller images deploy faster across networks
- **Storage Costs**: Less disk space and registry storage needed
- **Security**: Fewer packages mean fewer vulnerabilities
- **Build Times**: Smaller base images build faster

### Key Optimization Techniques

1. **Alpine Linux Base**: Uses musl libc instead of glibc, significantly reducing size
2. **Multi-Stage Builds**: Separates build-time dependencies from runtime
3. **Non-Root User**: Security best practice to limit container privileges
4. **Minimal Layers**: Combines commands to reduce layer count
5. **No Package Manager Cache**: Alpine doesn't include package indexes by default

### Size Comparison

| Approach | Image Size | Notes |
|----------|-----------|-------|
| python:3.12 | ~1000MB | Full Debian-based image |
| python:3.12-slim | ~150MB | Debian with minimal packages |
| python:3.12-alpine | ~50MB | Alpine Linux base |
| Optimized Alpine | **~15MB** | Multi-stage with cleanup |

## Result

You should achieve:
- ✅ Docker image under 25MB
- ✅ Functional web server responding on port 8000
- ✅ Container runs as non-root user
- ✅ Fast build and startup times

## Validation

```bash
# Check image size
docker images advent-day1:latest --format "{{.Size}}"
# Should show: ~15MB

# Verify non-root user
docker run --rm advent-day1:latest whoami
# Should show: appuser

# Test application
curl http://localhost:8000
# Should return: Hello from Advent of DevOps!
```

## Links

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Alpine Linux Docker Images](https://hub.docker.com/_/alpine)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Python Docker Official Images](https://hub.docker.com/_/python)
- [Node.js Docker Official Images](https://hub.docker.com/_/node)

## Share Your Success

Completed this challenge? Share your achievement!

**Tag [@thedevopsdaily](https://x.com/thedevopsdaily)** on X (formerly Twitter) with:
- Your final image size
- Any additional optimizations you discovered
- Screenshots of your running container

Use hashtags: **#AdventOfDevOps #Docker #Day1**
