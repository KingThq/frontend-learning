/**
 * @title leetcode 20.有效的括号
 * @param {string} s
 * @return {boolean}
 */

const isValid = function(s) {
  const stack = [];
  const bracket = {
    ')': '(',
    '}': '{',
    ']': '[',
  };

  for (let i = 0; i < s.length; i++) {
    stack.push(s[i]);

    if (stack.length < 2) continue;

    const theLastOne = stack[stack.length - 1];
    const theLastTwo = stack[stack.length - 2];

    if (theLastTwo === bracket[theLastOne]) {
      stack.pop();
      stack.pop();
    }
  }

  return stack.length === 0;
};

isValid('()[]{}');