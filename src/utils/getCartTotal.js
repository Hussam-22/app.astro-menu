export default function getCartTotal(cart, tax = 0) {
  const orderValue = cart.reduce((accumulator, portion) => accumulator + portion.price, 0);
  const taxValue = +(orderValue * (tax / 100)).toFixed(2);
  const calculatedTotalBill = orderValue + taxValue;

  return calculatedTotalBill;
}
