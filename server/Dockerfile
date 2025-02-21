# 使用官方 Node.js 圖像作為基礎圖像
FROM node:14

# 設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝應用依賴
RUN npm install

# 複製應用代碼
COPY . .

# 暴露應用運行的端口
EXPOSE 8080

# 運行應用
CMD ["node", "server.js"]