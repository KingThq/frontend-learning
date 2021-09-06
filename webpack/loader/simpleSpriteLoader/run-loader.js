const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');

runLoaders({
  resource: './loaders/index.css',
  loaders: [path.join(__dirname, './loaders/sprite-loader.js')],
  readSource: fs.readFile.bind(fs),
}, (err, result) => {
  err ? console.error(err) : null;
})