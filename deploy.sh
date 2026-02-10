#!/bin/bash

# 部署脚本
set -e

echo "开始部署 v-code 项目到 HZUS 服务器..."

# 服务器配置
SSH_HOST="HZ-US-code_deploy"
DEPLOY_DIR="/var/www/v-code"
PROJECT_NAME="v-code"

# 1. 同步代码到服务器
echo "步骤 1/5: 同步代码到服务器..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  ./ ${SSH_HOST}:${DEPLOY_DIR}/

# 2. 在服务器上构建和启动容器
echo "步骤 2/5: 在服务器上构建 Docker 镜像..."
ssh ${SSH_HOST} "cd ${DEPLOY_DIR} && docker compose build"

echo "步骤 3/5: 停止旧容器..."
ssh ${SSH_HOST} "cd ${DEPLOY_DIR} && docker compose down || true"

echo "步骤 4/5: 启动新容器..."
ssh ${SSH_HOST} "cd ${DEPLOY_DIR} && docker compose up -d"

echo "步骤 5/5: 清理未使用的 Docker 镜像..."
ssh ${SSH_HOST} "docker image prune -f"

echo "部署完成！"
echo "访问地址: https://v-code.vesper36.com"
