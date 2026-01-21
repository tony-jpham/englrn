# EnglRN Deployment Guide on Google Cloud Platform (GCP)

## 📋 Table of Contents
1. [Preparation](#preparation)
2. [Create GCP Project](#create-gcp-project)
3. [Create Compute Engine VM](#create-compute-engine-vm)
4. [Install Dependencies](#install-dependencies)
5. [Deploy Application](#deploy-application)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## 🛠️ Preparation

### Requirements
- ✅ Google Account
- ✅ GCP Project (can create new)
- ✅ Billing enabled on GCP
- ✅ GCP CLI installed (optional but recommended)

### Install GCP CLI (Local Machine)
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

## 🌐 Create GCP Project

### Step 1: Create Project on GCP Console

```bash
# Or use CLI
gcloud projects create englrn-deployment --name="EnglRN Deployment"
gcloud config set project englrn-deployment
```

### Step 2: Enable Required APIs

```bash
# Enable Compute Engine API
gcloud services enable compute.googleapis.com

# Enable Cloud Build API (optional, for CI/CD)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry (optional)
gcloud services enable containerregistry.googleapis.com
```

---

## 🖥️ Create Compute Engine VM

### Step 1: Create VM Instance via CLI (Recommended)

```bash
# Create VM instance
gcloud compute instances create englrn-server \
  --zone=asia-southeast1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server \
  --scopes=default,cloud-platform

# Or e2-small if you need better performance
# --machine-type=e2-small \
```

### Step 2: Configure Firewall

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

# Allow SSH (automatically enabled)
gcloud compute firewall-rules create allow-ssh \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0
```

### Step 3: Get IP Address

```bash
gcloud compute instances describe englrn-server \
  --zone=asia-southeast1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

---

## 🔗 SSH into VM

### Step 1: Connect via SSH

```bash
# Use gcloud CLI (recommended)
gcloud compute ssh englrn-server --zone=asia-southeast1-a

# Or use SSH directly
ssh -i ~/.ssh/gcp_key ubuntu@YOUR_EXTERNAL_IP
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 📦 Install Dependencies

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### Step 2: Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Add permission
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### Step 3: Install Git

```bash
sudo apt install -y git
git --version
```

### Step 4: Install Node.js (Optional, if you need to run scripts)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 🚀 Deploy Application

### Step 1: Clone Repository

```bash
# Create working directory
mkdir -p ~/projects
cd ~/projects

# Clone project
git clone https://github.com/yourusername/englrn.git
cd englrn
```

### Step 2: Configure Environment Variables

#### Method 1: Using echo (Fastest - No editor installation needed)

```bash
cat > .env << 'EOF'
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
DISCORD_HOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
ENG_LRN_AVATAR_URL=https://your-avatar-url.png
WORD_PER_DAY=10
NODE_ENV=production
EOF
```

**Verify:**
```bash
cat .env
```

#### Method 2: Using nano (Installation required)

```bash
# If nano is not available, install first
sudo apt install -y nano

# Create & edit .env
nano .env
```

Enter the following content:
```env
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
DISCORD_HOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
ENG_LRN_AVATAR_URL=https://your-avatar-url.png
WORD_PER_DAY=10
NODE_ENV=production
```

**Save file:** `Ctrl+X` → `Y` → `Enter`

#### Method 3: Using vi/vim

```bash
vi .env
```

- Press `i` to enter insert mode
- Paste .env content
- Press `Esc` then type `:wq` to save

#### Method 4: Using cat with heredoc (Recommended)

```bash
# Simplest method, no editor needed
cat > .env <<EOF
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/englrn
DISCORD_HOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
ENG_LRN_AVATAR_URL=https://your-avatar-url.png
WORD_PER_DAY=10
NODE_ENV=production
EOF

# Verify file was created correctly
cat .env

# Or view file with less
less .env
```

### Step 3: Build Docker Image

```bash
# Navigate to project directory
cd ~/projects/englrn

# Build image
docker-compose build

# Or build with specific tag
docker build -t englrn-backend:v1.0 .
```

**Note:** This step may take 2-5 minutes depending on internet speed

### Step 4: Run Container

```bash
# Use Docker Compose (Recommended)
docker-compose up -d

# Or run manually
docker run -d \
  --name englrn-backend \
  -p 8080:8080 \
  --env-file .env \
  --restart unless-stopped \
  englrn-backend:v1.0
```

### Step 5: Check Container Status

```bash
# List running containers
docker ps

# View logs
docker-compose logs -f englrn-app

# Or
docker logs -f englrn-backend
```

**Expected output:**
```
✅ MongoDB connected
Server running on port 8080
```

---

## 🔧 Production Configuration

### Step 1: Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/englrn
```

Enter the following content:
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

**Save file:** `Ctrl+X` → `Y` → `Enter`

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/englrn /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 2: Setup SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d YOUR_DOMAIN

# Auto-renew
sudo systemctl enable certbot.timer
```

### Step 3: Configure PM2 (Process Manager - Optional)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem.config.js
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

### Step 1: View Real-time Logs

```bash
# Docker Compose logs
docker-compose logs -f englrn-app --tail=100

# Or Docker logs
docker logs -f englrn-backend --tail=100
```

### Step 2: Monitor Container Status

```bash
# Monitor dashboard
docker stats englrn-backend

# Container health status
docker-compose ps
```

### Step 3: Setup Log Rotation

```bash
# Create log rotation config
sudo nano /etc/logrotate.d/englrn
```

Enter the following:
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

### Step 4: Setup Cloud Logging (GCP)

```bash
# Install logging agent
sudo curl https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh | sudo bash --

sudo apt-get update && sudo apt-get install -y google-cloud-ops-agent

# Start agent
sudo service google-cloud-ops-agent start
```

---

## 🔄 Updates & Maintenance

### Step 1: Deploy New Updates

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

### Step 2: Backup Data

```bash
# Export MongoDB data
docker exec englrn-backend mongodump \
  --uri="$MONGODB_URI" \
  --out=/app/backup

# Backup to GCP Cloud Storage
gsutil -m cp -r ~/projects/englrn/backup gs://your-bucket/englrn-backup-$(date +%Y%m%d)
```

### Step 3: Cleanup Unused Resources

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

### Container won't start

```bash
# Check logs
docker-compose logs englrn-app

# Check environment variables
docker-compose config

# Restart container
docker-compose restart englrn-app
```

### MongoDB Connection Error

```bash
# Test connection from inside container
docker exec englrn-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌', err.message));
"

# Check MONGODB_URI
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
# Check port 8080
netstat -tulpn | grep 8080

# Kill process
sudo kill -9 PID

# Or change port in docker-compose.yml
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker images
docker system prune -a --volumes

# Increase VM disk (if needed)
gcloud compute disks resize englrn-server --size=50GB --zone=asia-southeast1-a
```

---

## 📝 Final Checklist

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
