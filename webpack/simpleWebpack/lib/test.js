const { getAST, getDependencies, transform } = require('./parser');
const path = require('path');

const ast = getAST(path.join(__dirname, '../src/index.js'));
const dependency = getDependencies(ast);
const code = transform(ast);

console.log(code)