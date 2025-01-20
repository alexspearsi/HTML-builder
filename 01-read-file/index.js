const fs = require('fs');
const path = require('path');
const readableStream = fs.createReadStream(path.join(__dirname, 'text.txt'));
readableStream.on('data', (data) => console.log(data.toString()));
