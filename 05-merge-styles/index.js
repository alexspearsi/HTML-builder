const fs = require('fs');
const path = require('path');

const CSSFolder = path.join(__dirname, 'styles');
const bunddleFile = path.join(__dirname, 'project-dist', 'bundle.css');
let newCSS = '';

fs.readdir(CSSFolder, (err, files) => {
  if (err) {
    console.log(err.message);
  }

  const cssFiles = files.filter((file) => path.extname(file) === '.css');
  let processed = 0;

  cssFiles.forEach((file) => {
    const readableStream = fs.createReadStream(path.join(CSSFolder, file));
    readableStream.on('data', (data) => {
      newCSS += data;
    });

    readableStream.on('end', () => {
      processed++;

      if (processed === cssFiles.length) {
        const output = fs.createWriteStream(bunddleFile);
        output.write(newCSS);
      }
    });
  });
});
