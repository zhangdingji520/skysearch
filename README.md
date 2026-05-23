# SkySearch — 机票搜索

基于 React + Vite（前端）+ Express（后端 Vercel Serverless）构建的中文机票搜索网站。

## 部署到 Vercel 步骤

### 第一步：上传到 GitHub

1. 在 [github.com](https://github.com) 创建一个新的仓库（New repository）
2. 仓库名可以叫 `skysearch`，设置为 Public 或 Private 均可
3. 在本地解压缩这个压缩包，然后运行以下命令：

```bash
cd skysearch
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/skysearch.git
git push -u origin main
```

### 第二步：部署到 Vercel

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New → Project**
3. 找到并选择你的 `skysearch` 仓库，点击 **Import**
4. 在配置页面：
   - **Framework Preset**：选择 `Vite`
   - **Build Command**：`npm run build`（默认即可）
   - **Output Directory**：`dist/public`
   - **Install Command**：`npm install`（默认即可）
5. **无需设置任何环境变量**（不需要数据库、不需要 API Key）
6. 点击 **Deploy**，等待 2-3 分钟即可完成

部署成功后 Vercel 会给你一个 `.vercel.app` 结尾的域名，可以直接访问。

## 无需配置的内容

- 数据库：**不需要**（机场数据已写入代码）
- API Key：**不需要**（航班查询凭证已内置）
- 环境变量：**不需要**

## 本地开发

```bash
npm install
npm run dev
```

前端运行在 http://localhost:5173，API 通过 Vercel Dev 运行。

如需本地同时运行后端：
```bash
npm install -g vercel
vercel dev
```
