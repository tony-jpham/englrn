# Hướng Dẫn Deploy EnglRN trên Google Cloud Platform (GCP)

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Tạo GCP Project](#tạo-gcp-project)
3. [Tạo Compute Engine VM](#tạo-compute-engine-vm)
4. [Cài Đặt Dependencies](#cài-đặt-dependencies)
5. [Deploy Ứng Dụng](#deploy-ứng-dụng)
6. [Cấu Hình Production](#cấu-hình-production)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## 🛠️ Chuẩn Bị

### Yêu Cầu
- ✅ Google Account
- ✅ GCP Project (có thể tạo mới)
- ✅ Billing enabled trên GCP
- ✅ GCP CLI installed (optional nhưng recommended)

### Cài Đặt GCP CLI (Local Machine)
```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## 🌐 Tạo GCP Project

### Bước 1: Tạo Project trên GCP Console

```bash
# Hoặc sử dụng CLI
gcloud projects create englrn-deployment --name="EnglRN Deployment"
gcloud config set project englrn-deployment
```

### Bước 2: Enable Required APIs

```bash
# Enable Compute Engine API
gcloud services enable compute.googleapis.com

# Enable Cloud Build API (optional, cho CI/CD)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry (optional)
gcloud services enable containerregistry.googleapis.com
```

---

## 🖥️ Tạo Compute Engine VM

### Bước 1: Tạo VM Instance qua CLI (Recommended)

```bash
# Tạo VM instance
gcloud compute instances create englrn-server \
  --zone=asia-southeast1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server \
  --scopes=default,cloud-platform

# Hoặc e2-small nếu cần performance tốt hơn
# --machine-type=e2-small \
```

### Bước 2: Cấu Hình Firewall

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server

# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=https-server

# Allow SSH (tự động được enable)
gcloud compute firewall-rules create allow-ssh \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0
```

### Bước 3: Lấy IP Address

```bash
gcloud compute instances describe englrn-server \
  --zone=asia-southeast1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

---

## 🔗 SSH vào VM

### Bước 1: Kết Nối SSH

```bash
# Sử dụng gcloud CLI (recommended)
gcloud compute ssh englrn-server --zone=asia-southeast1-a

# Hoặc SSH thông thường
ssh -i ~/.ssh/gcp_key ubuntu@YOUR_EXTERNAL_IP
```

### Bước 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 📦 Cài Đặt Dependencies

### Bước 1: Cài Đặt Docker

```bash
# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user hiện tại vào docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### Bước 2: Cài Đặt Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Thêm permission
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### Bước 3: Cài Đặt Git

```bash
sudo apt install -y git
git --version
```

### Bước 4: Cài Đặt Node.js (Optional, nếu cần run scripts)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 🚀 Deploy Ứng Dụng

### Bước 1: Clone Repository

```bash
# Tạo working directory
mkdir -p ~/projects
cd ~/projects

# Clone dự án
git clone https://github.com/yourusername/englrn.git
cd englrn
```

### Bước 2: Cấu Hình Environment Variables

```bash
# Tạo .env file
nano .env
```

Nhập nội dung sau:
```env
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
DISCORD_HOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
ENG_LRN_AVATAR_URL=https://your-avatar-url.png
WORD_PER_DAY=10
NODE_ENV=production
```

**Lưu file:** `Ctrl+X` → `Y` → `Enter`

### Bước 3: Build Docker Image

```bash
# Đứng trong thư mục dự án
cd ~/projects/englrn

# Build image
docker-compose build

# Hoặc build với tag cụ thể
docker build -t englrn-backend:v1.0 .
```

**Lưu ý:** Bước này có thể mất 2-5 phút tùy vào tốc độ internet

### Bước 4: Run Container

```bash
# Sử dụng Docker Compose (Recommended)
docker-compose up -d

# Hoặc run manual
docker run -d \
  --name englrn-backend \
  -p 8080:8080 \
  --env-file .env \
  --restart unless-stopped \
  englrn-backend:v1.0
```

### Bước 5: Kiểm Tra Container Status

```bash
# List running containers
docker ps

# View logs
docker-compose logs -f englrn-app

# Hoặc
docker logs -f englrn-backend
```

**Expected output:**
```
✅ MongoDB connected
Server running on port 8080
```

---

## 🔧 Cấu Hình Production

### Bước 1: Cài Đặt Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Tạo config cho Nginx
sudo nano /etc/nginx/sites-available/englrn
```

Nhập nội dung:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Lưu file:** `Ctrl+X` → `Y` → `Enter`

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/englrn /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Bước 2: Setup SSL Certificate (Optional nhưng Recommended)

```bash
# Cài Certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy certificate
sudo certbot --nginx -d YOUR_DOMAIN

# Auto-renew
sudo systemctl enable certbot.timer
```

### Bước 3: Cấu Hình PM2 (Process Manager - Optional)

```bash
# Cài PM2 globally
sudo npm install -g pm2

# Tạo ecosystem.config.js
cat > ~/projects/englrn/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'englrn-app',
    script: './bin/www',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start PM2
pm2 start ecosystem.config.js

# Setup PM2 startup on reboot
pm2 startup
pm2 save
```

---

## 📊 Monitoring & Logging

### Bước 1: View Real-time Logs

```bash
# Docker Compose logs
docker-compose logs -f englrn-app --tail=100

# Hoặc Docker logs
docker logs -f englrn-backend --tail=100
```

### Bước 2: Monitor Container Status

```bash
# Monitor dashboard
docker stats englrn-backend

# Container health status
docker-compose ps
```

### Bước 3: Setup Log Rotation

```bash
# Tạo log rotation config
sudo nano /etc/logrotate.d/englrn
```

Nhập:
```
~/projects/englrn/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        docker-compose -f ~/projects/englrn/docker-compose.yml restart englrn-app > /dev/null 2>&1 || true
    endscript
}
```

### Bước 4: Setup Cloud Logging (GCP)

```bash
# Install logging agent
sudo curl https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh | sudo bash --

sudo apt-get update && sudo apt-get install -y google-cloud-ops-agent

# Start agent
sudo service google-cloud-ops-agent start
```

---

## 🔄 Cập Nhật & Maintenance

### Bước 1: Deploy Update Mới

```bash
cd ~/projects/englrn

# Pull latest code
git pull origin main

# Rebuild image
docker-compose build --no-cache

# Restart container
docker-compose up -d

# Verify
docker-compose logs -f englrn-app
```

### Bước 2: Backup Data

```bash
# Export MongoDB data
docker exec englrn-backend mongodump \
  --uri="$MONGODB_URI" \
  --out=/app/backup

# Backup to GCP Cloud Storage
gsutil -m cp -r ~/projects/englrn/backup gs://your-bucket/englrn-backup-$(date +%Y%m%d)
```

### Bước 3: Cleanup Unused Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# View disk usage
du -sh ~/projects/englrn
```

---

## 🆘 Troubleshooting

### Container không start

```bash
# Check logs
docker-compose logs englrn-app

# Kiểm tra environment variables
docker-compose config

# Restart container
docker-compose restart englrn-app
```

### MongoDB Connection Error

```bash
# Test connection từ trong container
docker exec englrn-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌', err.message));
"

# Kiểm tra MONGODB_URI
docker exec englrn-backend echo $MONGODB_URI
```

### Discord Webhook Error

```bash
# Test webhook
curl -X POST $DISCORD_HOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content":"🧪 Test from VM"}'
```

### Port Already in Use

```bash
# Kiểm tra port 8080
netstat -tulpn | grep 8080

# Kill process
sudo kill -9 PID

# Hoặc change port trong docker-compose.yml
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker images
docker system prune -a --volumes

# Increase VM disk (nếu cần)
gcloud compute disks resize englrn-server --size=50GB --zone=asia-southeast1-a
```

---

## 📝 Checklist Cuối Cùng

- [ ] VM instance created on GCP
- [ ] Docker & Docker Compose installed
- [ ] Repository cloned
- [ ] .env file configured
- [ ] Docker image built successfully
- [ ] Container running and healthy
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (optional)
- [ ] Firewall rules configured
- [ ] Logs monitoring setup
- [ ] Backup strategy in place
- [ ] Domain configured (if applicable)

---

## 🚨 Emergency Commands

```bash
# Stop container
docker-compose down

# Start container
docker-compose up -d

# Full restart
docker-compose down && docker-compose up -d

# Remove and rebuild everything
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# SSH into running container
docker-compose exec englrn-app /bin/sh

# View real-time resource usage
docker stats --no-stream englrn-backend
```

---

## 📞 Support Resources

- GCP Documentation: https://cloud.google.com/docs
- Docker Documentation: https://docs.docker.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Discord Webhook: https://discord.com/developers/docs/resources/webhook

---

**Last Updated:** January 21, 2026
**Version:** 1.0
