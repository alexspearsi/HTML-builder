const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'secret-folder');

fs.readdir(folder, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    const symbol = Object.getOwnPropertySymbols(file);
    const objFile = {};

    if (file[symbol[0]] === 1) {
      objFile.type = path.extname(file.name);
      objFile.name = path.basename(file.name, path.extname(file.name));
      fs.stat(path.join(folder, file.name), (err, item) => {
        objFile.size = item.size;
        process.stdout.write(
          `${objFile.name} - ${objFile.type.slice(1)} - ${objFile.size}byte\n`,
        );
      });
    }
  });
});
