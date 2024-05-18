const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');

const logFilePath = 'public/content_status_log.txt';
const url = process.argv[2];

// Ensure the log file is cleared at the start
fs.writeFileSync(logFilePath, '');

function logStatus(status) {
  const timestamp = new Date().toISOString();
  const message = `${timestamp} - ${status}\n`;
  fs.appendFileSync(logFilePath, message);
  console.log(message);
}

async function checkContentStatus(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200 ? 'VIEWABLE' : 'REMOVED';
  } catch (error) {
    return 'REMOVED';
  }
}

// Check the content status and log it every minute
cron.schedule('* * * * *', async () => {
  const status = await checkContentStatus(url);
  logStatus(status);
});
