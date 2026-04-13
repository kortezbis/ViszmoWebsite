
const fs = require('fs');

const path = 'C:\\Users\\Kortez\\.gemini\\antigravity\\brain\\230eabcc-2629-44d1-9339-4e9a50f2b1cc\\.system_generated\\steps\\79\\output.txt';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const logs = data.result.result;

logs.forEach(log => {
    try {
        const event = JSON.parse(log.event_message);
        if (event.error) {
            console.log(`Time: ${event.time}, Method: ${event.method}, Path: ${event.path}, Error: ${event.error}`);
        } else if (log.level === 'error') {
            console.log(`Time: ${event.time}, Msg: ${log.msg}`);
        }
    } catch (e) {
        // Not JSON
    }
});
