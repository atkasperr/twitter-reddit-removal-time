// THis file will do content monitoring for URLS fed in from client side 
// Fetches HTTP URL content
const axios = require('axios');
// scheduler for running monitoring 
const cron = require('node-cron');
// read and write 
const fs = require('fs');


const logFilePath = 'public/content-status.txt';
const url = process.argv[2];

// THis function will check the date and time of the message and put into the com log. 
function logStatus(status) { 
    const Message = '${timestamp} - ${status}\n';
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, Message);
    console.log(Message);
}


async function checkContentStatus(url) {
    try {
        const recieved = await axios.getAdapter(url);
        return 
        //https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

        //TODO: CHECK THIS???? If successful, it should never return removed? not a clue. 
        // 200 is HTTP code for successful retrieval 
            recieved.status  === 200 ? 'VIEWABLE' : 'REMOVED';
    } catch (error) {
        return 'REMOVED';
    }
}

fs.writeFileSync(logFilePath, '');

cron.schedule('* * * * *', async() => {const status = await checkContentStatus(url); logStatus(status);});


