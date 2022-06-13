/**
 * @title 格式化金额，每三位加逗号
 * @param {string | number} money 金额
 * @returns 格式化后的金额
 */

 export const formatMoney = (money) => {
  const val = String(money);
  const cells = val.match(/^(-?)(\d*)(\.(\d+))?$/);
  const negative = cells[1];
  const decimal = cells[4] || '';
  let int = cells[2] || '0';

  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimal) {
    return negative ? `${negative}${int}.${decimal}` : `${int}.${decimal}`;
  }
  return negative ? `${negative}${int}` : int;
};