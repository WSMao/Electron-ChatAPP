# Electron-ChatApp

本篇文章記錄嘗試使用 Copilot 學習 Electron 技術的過程。

本篇涉及技術點 #Electron #Node.js #WebSocket #GCP。

## 專案概述

為了學習 Electron 一併測試 Copilot 之能力，以開發一個簡單的跨電腦通訊 Chat App 為目標，由我提出需求讓 Copilot 完成開發，並從中學習 Electron 知識點。

這個 Chat App 需要兩個程式：

- **Client**：在 PC 端運行 (使用 Electron)
- **Server**：在雲端運行 (使用 Node.js + WebSocket + GCP)

Chat App 的運作方式：

- Clients 透過相同的 `chat_id` 連線到 Server。
- Client-A 發送訊息到 Server，Server 會將訊息轉發給所有相同 `chat_id` 的 Clients (例如 Client-B 和 Client-C)。

---

## 準備步驟：

此專案會用到 Node.js 以及 npm 套件管理工具。如果尚未安裝，可以前往 [Node.js 官方網站](https://nodejs.org/) 下載並安裝最新版的 Node.js，npm 會隨 Node.js 一起安裝。

安裝完後以 `node - v` 查看是否成功安裝。

---

## 開發與本機測試

### Server 端 (Node.js + WebSocket + GCP)

Node.js 既可運行 PC UI 程式、可與 OS 互動，還可用來開發 Server 網路服務，很棒吧。透過 Google Cloud Platform (GCP) 部署 Server 程式，省去自行架設伺服器和網路環境的麻煩。


先進入 server 資料夾，可看到主要的檔案結構：

- `server.js` (WebSocket 伺服器程式)
- `Dockerfile` (部屬容器到 GCP cloud run 的執行步驟)
- `package.json` (管理專案依賴)，初始化一個新的 npm 專案(`npm init -y`)時產生。
- `package-lock.json` 是一個很重要的文件，主要用來鎖定專案的依賴版本，保證每次安裝依賴時都能夠安裝相同版本的庫。

**安裝 WebSocket 套件**:
   ```sh
   npm install ws
   ```

#### WebSocket 技術特點

WebSocket 適用於即時通訊，很適合作為 Chat App 的通訊方式，主要特點：

- **雙向 & 持久性**：持久連線適合即時更新的應用
- **基於 TCP**：提供 `ws://` 和 `wss://` 兩種應用層協議，`wss` 跟 `https` 一樣是有加密的。
- **瀏覽器內建支援**：使用 `WebSocket` 物件即可連線

**若要在本地端測試**

   將 `server.js` 內 `new WebSocket.Server` 這行改為:
   ```js
   const wss = new WebSocket.Server({ port: 8080 });
   ```

   這樣 server 就是在 localhost 上提供服務了。

**啟動 server 程式**:
   ```sh
   node server.js
   ```

#### 使用 nodemon 進行熱重載

開發時，可改用 `nodemon` 來啟動 server 程式。這樣在 server.js 存檔時可以自動 reload Server，就不用每次改 server.js 程式都得手動重啟程式。

```sh
npm install -g nodemon
nodemon server.js
```

---

### Client 端 (Electron)

選擇了 Electron 主要看上他跨平台的能力，其核心技術如下：

- **Node.js**：作為後端運行環境
- **Chromium**：提供前端渲染能力

首先進入 client 資料夾，可看到主要的檔案結構：

- `main.js` (Electron 主程式)，這是 `package.json` 定義之程式進入點，運行 Electron 主程式。
- `index.html` (前端 UI)，這是應用的 UI 介面，會由 `main.js`引用。
- `package.json` (管理專案依賴)，初始化一個新的 npm 專案(`npm init -y`)時產生。
- `package-lock.json` 是一個很重要的文件，主要用來鎖定專案的依賴版本，保證每次安裝依賴時都能夠安裝相同版本的庫。


**安裝 Electron**：
   在 client 資料夾中，執行以下命令安裝 Electron：
   ```sh
   npm install electron --save-dev
   ```

   這樣會把 Electron 安裝為開發依賴並儲存在 `node_modules/` 中，並更新 `package.json` 文件。

**若要在本地端測試**

   將 `index.html` 內 `new WebSocket` 這行改為:
   ```html
   ws = new WebSocket('ws://localhost:8080');
   ```
   這樣就可以取用 localhost 提供的 server 服務了

**設定啟動 Electron 的腳本**：
   打開 `package.json`，找到 `"scripts"` 部分，並新增啟動 Electron 的指令。例如：
   ```json
   "scripts": {
     "start": "electron ."
   }
   ```

**啟動你的 Electron 應用**:

   ```sh
   npm start
   ```
   
   此時即可看到 client 端 Electron app 畫面了。 

   > Note: \
   > `npm start` 是 `npm run start` 簡化版。\
   > node <filename.js> 是直接運行檔案。\
   > npm run \<script> 是透過 npm 執行 package.json 中定義的腳本，這可以包含更多自定義選項或套件。

---

## 打包與佈署

先進行 server 部署，因為 server 服務上線後，client 端需要修改，client 端需要套用 GCP 服務的 URL。

### Server 端 (GCP 部署)

選擇 Google Cloud Run 來運行 WebSocket 伺服器，因為：

- 支援容器化應用
- 可持續運行 WebSocket 連線

#### 部署步驟

1. 註冊 GCP 帳號並安裝 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. 建立 `Dockerfile`
3. 透過 GCP CLI 部署：

```sh
# gcloud 工具初始化，這邊可能會跳轉道 google 驗證; 也會透過一些問答引導設定
gcloud init
# 可能會需要指定帳戶，使用以下指令設定及查詢。註: 請改為自己的帳號。
gcloud config set account <your_google_account>
gcloud auth list # 查看啟動帳戶
# 取得專案 id
gcloud config get-value project
# 建立 docker image，gcloud 會照著 Dockerfile 執行。 註: 請改為自己的專案 id/docker 名稱。
gcloud builds submit --tag gcr.io/<my-gcp-project-id>/<docker_name>
# 部署到 cloud run。 註: 請改為自己的 cloud run 服務名稱，以及專案 id/docker 名稱。
gcloud run deploy <cloud_run_service> --image gcr.io/<my-gcp-project-id>/<docker_name> --platform managed --region us-central1 --allow-unauthenticated
```

最後一部執行完後，可以看到 `Service URL`，我們需要修改 client 端以取用該服務。

將 `client/index.html` 內 `new WebSocket` 這行改為:
   ```html
   ws = new WebSocket('wss://<your_service_url>/');
   ```

部署完成後可以到 GCP 後台，`該專案 id -> cloud run -> 服務`，可以看到部屬上去的容器。
進一步`點選容器 -> 紀錄` 還可以看到 node.js `console.log()` 的訊息輸出。


### Client 端 (Electron 打包)

兩種打包方式：

- **electron-packager**：快速打包，適合開發測試
- **electron-builder**：支援自動更新、簽名，適合正式發布

#### electron-packager

**安裝**
```sh
npm install electron-packager --save-dev
```

**打包 Windows 程式**
```sh
npx electron-packager . --platform=win32 --arch=x64 --out=dist
```

**打包 MacOS 程式**
```sh
npx electron-packager . --platform=darwin --arch=x64 --out=dist
```

#### electron-builder

**安裝**
```sh
npm install electron-builder --save-dev
```

**於 `package.json` 加入 `build` 配置**

```json
{
    "scripts": {
        "start": "electron .",
        "build": "electron-builder"
    },

    "build": {
        "appId": "com.example.electron-chatapp",
        "mac": {
            "category": "public.app-category.utilities",
            "target": "dmg"
        },
        "win": {
            "target": "nsis"
        }
    },
}
```

**執行 electron-builder**
```sh
npm run build
```

electron-builder 就會打包你的應用，並且根據你在 build 配置中設置的目標平台（例如 dmg 或 nsis）生成對應的安裝包。

> Note: Windows 下無法為 Mac 平台打包，需直到 Mac 環境下進行打包。


---

## 小結

成功部署後，Users 即可在不同 PC 上運行 Clients，並透過 Server 進行即時聊天，享受跨裝置的即時通訊體驗！🎉
