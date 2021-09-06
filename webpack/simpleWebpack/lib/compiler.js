/**
 * 构建模块包，输出打包后的文件
 */
const fs = require('fs');
const path = require('path');
 const { getAST, getDependencies, transform } = require('./parser');

module.exports = class Compiler {
  constructor(options) {
    const { entry, output } = options;

    this.entry = entry;
    this.output = output;
    this.modules = [];
  }

  run() {
    const entryModule = this.buildModule(this.entry, true);
    this.modules.push(entryModule);
    this.modules.forEach(module => {
      module.dependencies.forEach(dependency => {
        this.modules.push(this.buildModule(dependency));
      });
    });
    this.emitFiles();
  }

  buildModule(filename, isEntry) {
    let ast;
    if (isEntry) {
      ast = getAST(filename);
    } else {
      const absolutePath = path.join(process.cwd(), './src', filename);
      ast = getAST(absolutePath);
    }

    return {
      filename,
      dependencies: getDependencies(ast),
      transfromCode: transform(ast),
    };
  }

  emitFiles() {
    const outputpath = path.join(this.output.path, this.output.filename);
    let modules = '';
    this.modules.forEach(module => {
      modules += `'${module.filename}': function (require, module, exports) { ${module.transfromCode} },`
    });

    const bundle = `
      (
        function(modules) {
          function require(filename) {
            const fn = modules[filename];

            const module = { exports: {} };

            fn(require, module, module.exports);

            return module.exports;
          }

          require('${this.entry}');
        }
      )({${modules}})
    `;

    fs.writeFileSync(outputpath, bundle, 'utf-8');
  }
}