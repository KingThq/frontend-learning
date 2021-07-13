export default add = (a, b) => {
  let i = a.length - 1;
  let j = b.length - 1;

  let carry = 0; // 进位
  let res = '';
  while (i >= 0 || j >= 0) {
    let x = 0;
    let y = 0;
    let sum;

    if (i >= 0) {
      x = a[i] - '0'; // 变成 number 类型
      i --;
    }

    if (j >= 0) {
      y = b[j] - '0';
      j --;
    }

    sum = x + y + carry;

    if (sum >= 10) {
      carry = 1;
      sum -= 10;
    } else {
      carry = 0;
    }

    // 0 + ''
    res = res + sum;
  }

  if (carry) {
    res = carry + res;
  }

  return res;
}

// add('99', '1')
// add('99', '100')
// add('123', '321');