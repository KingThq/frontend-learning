const tryExecSync = (cb) => {
  let result = '';
  try {
    result = cb();
  } catch (e) {
    result = e.message;
  }
  return result;
}

module.exports = {
  tryExecSync,
}