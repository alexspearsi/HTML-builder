const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));

process.stdout.write('Hello!\n');

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }

  output.write(data);
});

process.on('exit', () => process.stdout.write('Bye!'));
process.on('SIGINT', () => {
  process.exit();
});