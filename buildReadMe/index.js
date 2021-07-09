const fs = require('fs');
const path = require('path');

const { gitAddAllFile, gitStatusList } = require('./cmd/git');
const { cz } = require('./cmd/npx');
const { paths, ignoreDirName } = require('./utils');

const codeTitleTree = {};
const separator = ' '.repeat(4);
let codeTitleCtx = '';

const pushItemInCodeTitleTree = (node) => {
  const { titlePath, dirName, fileName, isDir } = node;

  const treePaths = path.dirname(titlePath).split(path.sep);
  console.log('treePaths:', treePaths)
  let parent = codeTitleTree;
  treePaths.forEach(dir => {
    if (dir === '.') return;

    if (!parent[dir]) {
      parent[dir] = {};
    }
    parent = parent[dir];
  });
  parent[isDir ? dirName : fileName] = { ...node };
  console.log('parent:', parent)
}

const handleDirTitle = (params) => {
  const { dirPath } = params;

  const packageJsonFile = path.join(dirPath, 'package.json');
  const title = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8')).description || '';
  console.log('titlePath:', path.relative(paths.rootPath, dirPath))
  pushItemInCodeTitleTree({
    ...params,
    isDir: true,
    titlePath: path.relative(paths.rootPath, dirPath),
    title,
  });
}

const handleFileTitle = (params) => {
  const { filePath } = params;

  const ctx = fs.readFileSync(filePath, 'utf8');
  console.log('FileTitle ctx:', ctx)
  const reg = / @title(.*)\n/;
  const matchRes = ctx.match(reg);
  console.log('matchRes:', matchRes)
  if (matchRes) {
    const title = matchRes[1];
    pushItemInCodeTitleTree({
      ...params,
      isDir: false,
      titlePath: path.relative(paths.rootPath, filePath),
      title,
    });
  }
}

const traverseDir = (dirPath, indent) => {
  if (ignoreDirName.includes(path.basename(dirPath))) {
    return;
  }

  const paths = fs.readdirSync(dirPath);
  const exitPackageJsonFile = paths.includes('package.json');
  if (exitPackageJsonFile) {
    handleDirTitle({
      dirPath,
      fileName: '',
      dirName: path.basename(dirPath),
      indent,
    });
    return;
  }

  // 否则需要单独处理
  paths.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      traverseDir(filePath, indent + 1);
      return;
    }

    handleFileTitle({
      filePath,
      fileName: file,
      dirName: path.basename(dirPath),
      indent,
    });
  });
}

// 构建所有源码 Title 信息到 codeTitleTree 对象
const traverseCodeDir = () => {
  const codePaths = fs.readdirSync(paths.rootPath);
  console.log('codePaths:', codePaths)
  codePaths.forEach(file => {
    const filePath = path.join(paths.rootPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      traverseDir(filePath, 0);
    }
  });
}

const outputItemInfo = (info, indent, isNode) => {
  if (!isNode) {
    const line = `${separator.repeat(indent)}${info}`;
    codeTitleCtx += `${line}\n`;
    return;
  }

  const line = `${separator.repeat(indent)}${info.isDir ? info.dirName : info.fileName}: ${info.title}`;
  codeTitleCtx += `${line}\n`;
}

// 遍历 codeTitleTree 对象提取有用信息输出
const traverseTitleItem = (root = codeTitleTree, indent = 0) => {
  console.log('codeTitleTree:', root)
  if (!root) return;

  Object.keys(root).forEach(dir => {
    const node = root[dir];
    // 该节点没有详细信息，需要继续遍历
    if (node.title === undefined) {
      outputItemInfo(dir, indent, false);
      traverseTitleItem(node, indent + 1);
      return;
    }

    outputItemInfo(node, indent, true);
  });
  console.log('codeTitleCtx:', codeTitleCtx)
}

const createReadMeCtx = () => {
  console.log('Start build readme file.');
  const titleMdCtx = fs.readFileSync(paths.titlePath, 'utf8');
  const desMdCtx = fs.readFileSync(paths.descriptionPath, 'utf8');
  const codeTitleMdCtx = `<pre>${codeTitleCtx}</pre>`;

  const readMeCtx = `\n${titleMdCtx}\n\n${desMdCtx}\n\n${codeTitleMdCtx}\n`;
  return readMeCtx;
}

const writeNewReadMe = () => {
  const readMeCtx = createReadMeCtx();
  fs.writeFileSync(paths.readMePath, readMeCtx, 'utf8');
  console.log('Build readme end.');
}

const addAllFiles = () => {
  console.log('Add ReadMe files.');
  gitAddAllFile();
  console.log('Finish!');
}

const commitAllFiles = () => {
  cz();
}

const main = () => {
  traverseCodeDir();
  traverseTitleItem();
  createReadMeCtx();
  writeNewReadMe();
  addAllFiles();
  commitAllFiles();
}

main();
