# Docker Deployment Guide - EnglRN

## 📦 Docker Files

Dự án đã được cấu hình để chạy trong Docker containers:

- **Dockerfile** - Multi-stage build cho Node.js application
- **docker-compose.yml** - Orchestration cho dễ dàng deployment
- **.dockerignore** - Loại bỏ file không cần thiết

## 🚀 Quick Start

### 1. Chuẩn bị Environment Variables

Tạo file `.env` hoặc `.env.production` với các giá trị:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
DISCORD_HOOK_URL=https://discord.com/api/webhooks/...
ENG_LRN_AVATAR_URL=https://your-avatar-url.png
WORD_PER_DAY=10
NODE_ENV=production
```

### 2. Build và Run với Docker Compose

```bash
# Build image
docker-compose build

# Run container
docker-compose up -d

# View logs
docker-compose logs -f englrn-app

# Stop container
docker-compose down
```

### 3. Build Manual Docker Image

```bash
# Build image
docker build -t englrn-backend:latest .

# Run container
docker run -d \
  --name englrn-backend \
  -p 8080:8080 \
  -e MONGODB_URI=mongodb+srv://... \
  -e DISCORD_HOOK_URL=... \
  -e ENG_LRN_AVATAR_URL=... \
  englrn-backend:latest
```

## 📋 Docker Configuration Details

### Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Builder
- Base image: node:18-alpine
- Cài đặt dependencies từ package.json và yarn.lock

# Stage 2: Runtime
- Nhẹ hơn vì chỉ copy node_modules từ builder
- Sử dụng dumb-init để xử lý signals đúng cách
- Health check mỗi 30s
```

### docker-compose.yml

**Services:**
- **englrn-app**: Node.js backend application

**Configuration:**
- Port: 8080:8080
- Environment: Production variables từ .env file
- Restart policy: unless-stopped
- Health check: Enabled
- Network: englrn-network (custom bridge network)
- Volumes: ./logs:/app/logs (cho persistence logs)

## 🔍 Kiểm Tra Container

```bash
# List running containers
docker-compose ps

# View logs
docker-compose logs englrn-app

# Real-time logs
docker-compose logs -f englrn-app

# Connect to container
docker exec -it englrn-backend /bin/sh

# Health check status
docker-compose ps
```

## 🛠️ Troubleshooting

### Container không start
```bash
# Check logs
docker-compose logs englrn-app

# Verify environment variables
docker-compose config
```

### Connection tới MongoDB fail
```bash
# Kiểm tra MONGODB_URI trong .env
# Đảm bảo IP whitelist trong MongoDB Atlas
# Test connection từ trong container:
docker exec englrn-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('✅ MongoDB connected');
  }).catch(err => console.error('❌', err.message));
"
```

### Discord webhook không hoạt động
```bash
# Test webhook
docker exec englrn-backend node -e "
  const url = process.env.DISCORD_HOOK_URL;
  const axios = require('axios');
  axios.post(url, {
    content: '🧪 Test message from Docker'
  }).then(() => console.log('✅ Webhook works')).catch(err => console.error('❌', err.message));
"
```

## 📊 Performance Tips

1. **Multi-stage build**: Giảm kích thước image từ ~400MB xuống ~150MB
2. **Alpine Linux**: Lightweight base image (~5MB)
3. **Dumb-init**: Xử lý graceful shutdown
4. **Health check**: Tự động restart container nếu unhealthy

## 🌐 Deployment Options

### Local Development
```bash
docker-compose -f docker-compose.yml up
```

### Production (AWS/GCP/Azure)
```bash
# Push to container registry
docker tag englrn-backend:latest myregistry.azurecr.io/englrn-backend:latest
docker push myregistry.azurecr.io/englrn-backend:latest

# Deploy with orchestration (Kubernetes/Docker Swarm)
kubectl apply -f deployment.yaml
```

### Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml englrn
```

### Kubernetes (Optional - cần tạo deployment.yaml)
```bash
kubectl apply -f k8s-deployment.yaml
```

## 📈 Scaling

### Horizontal Scaling với Docker Compose
```bash
docker-compose up -d --scale englrn-app=3
```

### Load Balancing
Thêm nginx service vào docker-compose.yml để balance traffic.

## 🔐 Security Best Practices

- ✅ Không lưu secrets trong Dockerfile
- ✅ Sử dụng Alpine Linux (nhỏ, ít vulnerabilities)
- ✅ Non-root user (có thể thêm vào Dockerfile)
- ✅ Health checks enabled
- ✅ Restart policy configured
- ✅ .dockerignore configured

## 📝 Next Steps

1. Tạo `.env` file với production values
2. Build image: `docker-compose build`
3. Run: `docker-compose up -d`
4. Monitor: `docker-compose logs -f`
5. Deploy tới production environment
