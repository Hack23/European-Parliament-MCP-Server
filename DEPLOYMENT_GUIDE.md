# Deployment Guide

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - Deployment Guide</h1>

<p align="center">
  <strong>Complete deployment configurations for all MCP clients</strong><br>
  <em>Claude Desktop, VS Code, Docker, and production deployments</em>
</p>

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Claude Desktop Deployment](#claude-desktop-deployment)
- [VS Code Extension Deployment](#vs-code-extension-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

- **Node.js**: v24.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version

### Build Requirements

```bash
# Clone repository
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies
npm install

# Build project
npm run build

# Verify build
test -f dist/index.js && echo "Build successful"
```

---

## 🖥️ Claude Desktop Deployment

### 1. Build the Server

```bash
cd /path/to/European-Parliament-MCP-Server
npm install
npm run build
```

### 2. Configure Claude Desktop

**Config Location**:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration**:

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": [
        "/absolute/path/to/European-Parliament-MCP-Server/dist/index.js"
      ],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**:
- Use **absolute paths** (not `~` or relative paths)
- Use forward slashes `/` even on Windows
- Restart Claude Desktop after configuration changes

### 3. Verify Installation

1. Open Claude Desktop
2. Start a new conversation
3. Type: "What European Parliament tools are available?"
4. Claude should list the 10 MCP tools

### Troubleshooting

**Tools not appearing**:
```bash
# Check file exists
test -f /path/to/dist/index.js && echo "OK" || echo "Missing"

# Check permissions
ls -la /path/to/dist/index.js

# Check Claude logs (macOS)
tail -f ~/Library/Logs/Claude/main.log
```

---

## 📝 VS Code Extension Deployment

### 1. Install MCP Extension

```bash
# Install from VS Code Marketplace
code --install-extension mcp-extension
```

### 2. Build the Server

```bash
cd ${workspaceFolder}/European-Parliament-MCP-Server
npm install
npm run build
```

### 3. Configure VS Code

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "european-parliament": {
      "type": "stdio",
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}/European-Parliament-MCP-Server",
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 4. Reload VS Code

```
Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
> Developer: Reload Window
```

### 5. Verify Installation

1. Open Command Palette
2. Search for "MCP: List Tools"
3. Should show 10 European Parliament tools

---

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/

# Expose WebSocket port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health')"

# Run server
CMD ["node", "dist/index.js", "--transport", "websocket", "--port", "3000"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  ep-mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - CACHE_MAX_SIZE=500
      - CACHE_TTL=900000
      - RATE_LIMIT_REQUESTS=100
      - RATE_LIMIT_WINDOW=900000
    volumes:
      - cache-data:/app/cache
      - logs:/app/logs
    restart: unless-stopped
    networks:
      - mcp-network

volumes:
  cache-data:
  logs:

networks:
  mcp-network:
```

### 3. Build and Run

```bash
# Build image
docker-compose build

# Start service
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
curl http://localhost:3000/health
```

### 4. Connect MCP Client

```json
{
  "mcpServers": {
    "european-parliament": {
      "type": "websocket",
      "url": "ws://localhost:3000"
    }
  }
}
```

---

## 🚀 Production Deployment

### Architecture

```
                                    ┌─────────────────┐
                                    │  Load Balancer  │
                                    │    (nginx)      │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
              ┌─────▼─────┐           ┌─────▼─────┐           ┌─────▼─────┐
              │ MCP Server│           │ MCP Server│           │ MCP Server│
              │ Instance 1│           │ Instance 2│           │ Instance 3│
              └───────────┘           └───────────┘           └───────────┘
                    │                        │                        │
                    └────────────────────────┼────────────────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Shared Cache   │
                                    │    (Redis)      │
                                    └─────────────────┘
```

### 1. Nginx Load Balancer

`/etc/nginx/sites-available/mcp-server`:

```nginx
upstream mcp_backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 443 ssl http2;
    server_name mcp.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/mcp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://mcp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://mcp_backend;
    }
}
```

### 2. Systemd Service

`/etc/systemd/system/ep-mcp-server@.service`:

```ini
[Unit]
Description=European Parliament MCP Server (instance %i)
After=network.target

[Service]
Type=simple
User=mcp
WorkingDirectory=/opt/european-parliament-mcp-server
ExecStart=/usr/bin/node dist/index.js --transport websocket --port 300%i
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ep-mcp-server-%i

# Environment
Environment="NODE_ENV=production"
Environment="LOG_LEVEL=info"
Environment="PORT=300%i"

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/european-parliament-mcp-server/cache
ReadWritePaths=/opt/european-parliament-mcp-server/logs

# Resource limits
LimitNOFILE=65536
MemoryLimit=512M

[Install]
WantedBy=multi-user.target
```

**Enable and start services**:

```bash
# Enable 3 instances
sudo systemctl enable ep-mcp-server@{1..3}

# Start services
sudo systemctl start ep-mcp-server@{1..3}

# Check status
sudo systemctl status ep-mcp-server@*

# View logs
sudo journalctl -u ep-mcp-server@* -f
```

### 3. Monitoring

**Prometheus metrics** (if enabled):

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ep-mcp-server'
    static_configs:
      - targets:
          - 'localhost:3001'
          - 'localhost:3002'
          - 'localhost:3003'
```

**Log aggregation with journald**:

```bash
# View all server logs
sudo journalctl -u 'ep-mcp-server@*' --since "1 hour ago"

# Follow logs in real-time
sudo journalctl -u 'ep-mcp-server@*' -f

# Export logs
sudo journalctl -u 'ep-mcp-server@*' --since "24 hours ago" > server.log
```

### 4. Backup and Recovery

```bash
#!/bin/bash
# backup.sh - Backup cache and logs

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/ep-mcp-server"

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup cache
tar -czf "$BACKUP_DIR/$DATE/cache.tar.gz" /opt/european-parliament-mcp-server/cache/

# Backup logs
tar -czf "$BACKUP_DIR/$DATE/logs.tar.gz" /opt/european-parliament-mcp-server/logs/

# Backup configuration
cp /etc/systemd/system/ep-mcp-server@.service "$BACKUP_DIR/$DATE/"
cp /etc/nginx/sites-available/mcp-server "$BACKUP_DIR/$DATE/"

# Keep only last 7 days
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/$DATE"
```

---

## 🔧 Environment Variables

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `LOG_LEVEL` | `info` | Logging level (debug/info/warn/error) |
| `PORT` | `3000` | WebSocket server port |
| `CACHE_MAX_SIZE` | `500` | Maximum cache entries |
| `CACHE_TTL` | `900000` | Cache TTL in milliseconds (15 min) |
| `RATE_LIMIT_REQUESTS` | `100` | Maximum requests per window |
| `RATE_LIMIT_WINDOW` | `900000` | Rate limit window in ms (15 min) |
| `EP_API_BASE_URL` | (EP API) | European Parliament API base URL |

### Example Configuration

**Development**:
```bash
export NODE_ENV=development
export LOG_LEVEL=debug
export CACHE_TTL=60000  # 1 minute for testing
```

**Production**:
```bash
export NODE_ENV=production
export LOG_LEVEL=info
export CACHE_TTL=900000  # 15 minutes
export RATE_LIMIT_REQUESTS=100
```

---

## 🔍 Troubleshooting

### Server Won't Start

```bash
# Check Node.js version
node --version  # Must be v24.x+

# Check if port is in use
lsof -i :3000

# Check build
test -f dist/index.js && echo "OK" || echo "Run npm run build"

# Check dependencies
npm list --depth=0
```

### High Memory Usage

```bash
# Monitor memory
watch -n 1 'ps aux | grep "node.*index.js"'

# Reduce cache size
export CACHE_MAX_SIZE=100
export CACHE_TTL=300000  # 5 minutes
```

### Performance Issues

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Check EP API response time
time curl -s https://data.europarl.europa.eu/api/v2/meps > /dev/null

# Monitor with metrics
curl http://localhost:3000/metrics
```

---

## 📚 Additional Resources

- [API Usage Guide](./API_USAGE_GUIDE.md)
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant deployment demonstrating security excellence</em>
</p>
