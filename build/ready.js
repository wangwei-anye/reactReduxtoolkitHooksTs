const fs = require('fs-extra');
const path = require('path');
const rootPath = path.resolve(__dirname, '../');

const dist = path.resolve(rootPath, 'dist');
const staticInput = path.resolve(rootPath, 'public');
const staticOutput = path.resolve(rootPath, 'dist/static');
console.log('copy static files..............................................');

fs.emptyDirSync(dist); // clean cache
fs.ensureDirSync(staticInput);
fs.ensureDirSync(staticOutput);
const p1 = fs.copy(staticInput, staticOutput); // copy static files
const p2 = fs.copy(path.resolve(rootPath, 'robots.txt'), `${dist}/robots.txt`); // copy robots.txt

Promise.all([p1, p2])
  .then(() => console.log('Everything is ready! Begin build...'))
  .catch((err) => console.error(err));
