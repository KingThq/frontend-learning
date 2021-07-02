const path = require('path');

const rootPath = path.join(__dirname, '..', '..');
const readMePath = path.join(rootPath, 'README.md');

const templatePath = path.join(__dirname, '..', 'template');
const titlePath = path.join(templatePath, 'title.md');
const descriptionPath = path.join(templatePath, 'description.md');

const paths = {
  rootPath,
  readMePath,
  templatePath,
  titlePath,
  descriptionPath,
};

module.exports = {
  ...paths,
}