const fs = require('fs');
const path = require('path');

fs.mkdir(path.join(__dirname, 'files-copy'), { recursive: true }, (err) => {
  if (err) {
    console.log(`Ошибка ${err.message}`);
  }
});

const folder = path.join(__dirname, 'files');
const folderCopy = path.join(__dirname, 'files-copy');

fs.readdir(folder, (err, files) => {
  files.forEach((file) => {
    const filePath = path.join(folder, file);
    const fileCopyPath = path.join(folderCopy, file);

    fs.copyFile(filePath, fileCopyPath, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });

  fs.readdir(folderCopy, (err, filesCopy) => {
    if (err) {
      console.error(`Ошибка ${err.message}`);
    }

    filesCopy.forEach((fileName) => {
      if (!files.includes(fileName)) {
        const fileCopyPath = path.join(folderCopy, fileName);

        fs.unlink(fileCopyPath, (err) => {
          if (err) {
            console.log(`Ошибка ${err.message}`);
          } else {
            console.log(`Этот файл был удален ${fileName}`);
          }
        });
      }
    });
  });
});
