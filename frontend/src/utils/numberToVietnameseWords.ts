/**
 * Chuyển đổi số tiền VNĐ sang chữ tiếng Việt chuẩn quy chuẩn kế toán Việt Nam
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const SCALES = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readThreeDigits(n: number, readZeroHundred: boolean): string {
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  const ten = Math.floor(remainder / 10);
  const unit = remainder % 10;

  let result = '';

  if (hundred > 0 || readZeroHundred) {
    result += `${DIGITS[hundred]} trăm `;
  }

  if (ten > 1) {
    result += `${DIGITS[ten]} mươi `;
    if (unit === 1) result += 'mốt ';
    else if (unit === 5) result += 'lăm ';
    else if (unit > 0) result += `${DIGITS[unit]} `;
  } else if (ten === 1) {
    result += 'mười ';
    if (unit === 5) result += 'lăm ';
    else if (unit > 0) result += `${DIGITS[unit]} `;
  } else if (ten === 0 && (hundred > 0 || readZeroHundred) && unit > 0) {
    result += `lẻ ${DIGITS[unit]} `;
  } else if (unit > 0) {
    result += `${DIGITS[unit]} `;
  }

  return result.trim();
}

export function numberToVietnameseWords(amount: number): string {
  if (!amount || amount === 0) return 'Không đồng';
  if (amount < 0) return `Âm ${numberToVietnameseWords(Math.abs(amount)).toLowerCase()}`;

  const numStr = Math.floor(amount).toString();
  const groups: number[] = [];

  for (let i = numStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    groups.unshift(parseInt(numStr.substring(start, i), 10));
  }

  let words = '';
  for (let i = 0; i < groups.length; i++) {
    const groupVal = groups[i];
    const scaleIdx = groups.length - 1 - i;

    if (groupVal > 0) {
      const readZero = i > 0;
      const groupText = readThreeDigits(groupVal, readZero);
      const scaleText = SCALES[scaleIdx] ? ` ${SCALES[scaleIdx]}` : '';
      words += `${groupText}${scaleText} `;
    }
  }

  words = words.trim();
  if (!words) return 'Không đồng';

  // Capitalize first letter
  const formatted = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn';
  return formatted.replace(/\s+/g, ' ');
}
