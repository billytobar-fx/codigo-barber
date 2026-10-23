const invalidPhonePatterns = new Set([
  '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
  '1234567890', '0123456789', '3000000000', '3111111111', '3222222222'
]);

export function isValidColombianMobile(phone) {
  return /^3[0-9]{9}$/.test(phone) && !invalidPhonePatterns.has(phone);
}

export function restrictToDigits(input) {
  input.addEventListener('input', event => {
    const field = event.currentTarget;
    if (field instanceof HTMLInputElement) {
      field.value = field.value.replace(/[^0-9]/g, '').slice(0, 10);
    }
  });
}
