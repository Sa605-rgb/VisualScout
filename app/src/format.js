export function money(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Rs. 0";
  if (Number.isInteger(amount)) return `Rs. ${amount}`;
  return `Rs. ${amount.toFixed(2)}`;
}

export function shortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
