const fs = require('fs');
const path = require('path');

function makeDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function createWriteStream(filePath, html) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath, 'utf-8');
    stream.write(html);
    stream.on('open', () => resolve(stream));
    stream.on('error', (err) => reject(err));
  });
}

function createFolderAssets() {
  return new Promise((resolve) => {
    fs.mkdir(
      path.join(__dirname, 'project-dist', 'assets'),
      { recursive: true },
      () => {
        resolve();
      },
    );
  });
}

function createInnerFoldersOfAssets() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, 'assets'), (err, files) => {
      if (err) return reject(err);

      const promises = files.map((file) => {
        return new Promise((resolve, reject) => {
          fs.stat(path.join(__dirname, 'assets', file), (err, stat) => {
            if (err) return reject(err);

            if (stat.isDirectory()) {
              makeDirectory(
                path.join(__dirname, 'project-dist', 'assets', file),
              )
                .then(resolve)
                .catch(reject);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(promises).then(resolve).catch(reject);
    });
  });
}

function checkIfFolderExist() {
  return new Promise((resolve) => {
    fs.access(path.join(__dirname, 'project-dist'), (err) => {
      if (err?.code === 'ENOENT') {
        resolve();
      } else {
        fs.rm(
          path.join(__dirname, 'project-dist'),
          { recursive: true, force: true },
          () => {
            resolve();
          },
        );
      }
    });
  });
}

function addInnerFilesOfAssets() {
  return new Promise((resolve) => {
    fs.readdir(path.join(__dirname, 'assets'), (err, filesOfAssets) => {
      const files = filesOfAssets.filter((file) => !file.includes('.'));
      files.forEach((file) => {
        fs.readdir(path.join(__dirname, 'assets', file), (err, innerFiles) => {
          innerFiles.forEach((innerFile) => {
            fs.copyFile(
              path.join(__dirname, 'assets', file, innerFile),
              path.join(__dirname, 'project-dist', 'assets', file, innerFile),
              (err) => {
                if (err) {
                  throw new Error(`${err.message}`);
                }
                resolve();
              },
            );
          });
        });
      });
    });
  });
}

function compileCSSFile() {
  return new Promise((resolve) => {
    const CSSFolder = path.join(__dirname, 'styles');
    const bunddleFile = path.join(__dirname, 'project-dist', 'style.css');
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
      console.log(newCSS);
      resolve();
    });
  });
}

function updateHTML() {
  return new Promise((resolve) => {
    const objHTML = {};
    fs.readdir(path.join(__dirname, 'components'), (err, files) => {
      const promises = files.map((file) => {
        return new Promise((resolve) => {
          const text = fs.createReadStream(
            path.join(__dirname, 'components', file),
            'utf-8',
          );
          text.on('data', (text) => {
            objHTML[`{{${file.split('.')[0]}}}`] = text;
            resolve();
          });
        });
      });

      Promise.all(promises).then(() => resolve(objHTML));
    });
  });
}

function compileNewHTMLFile(data) {
  return new Promise((resolve) => {
    let objHTML = data;
    const htmlFile = fs.createReadStream(
      path.join(__dirname, 'template.html'),
      'utf-8',
    );
    htmlFile.on('data', (data) => {
      let html = data;
      for (const key of Object.keys(objHTML)) {
        html = html.replace(key, objHTML[key].trim());
      }
      resolve(html);
    });
  });
}

checkIfFolderExist()
  .then(() => makeDirectory(path.join(__dirname, 'project-dist')))
  .then(() =>
    createWriteStream(
      path.join(__dirname, 'project-dist', 'index.html'),
      'just created a html file',
    ),
  )
  .then(() =>
    createWriteStream(
      path.join(__dirname, 'project-dist', 'style.css'),
      'just created a css file',
    ),
  )
  .then(() => createFolderAssets('assets'))
  .then(() => createInnerFoldersOfAssets())
  .then(() => addInnerFilesOfAssets())
  .then(() => compileCSSFile())
  .then(() => updateHTML())
  .then((data) => compileNewHTMLFile(data))
  .then((data) => {
    const html = fs.createWriteStream(
      path.join(__dirname, 'project-dist', 'index.html'),
    );
    html.write(data);
  });
