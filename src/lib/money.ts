function grouped(amount: number) {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatUah(amount: number, _locale?: string) {
  return `${grouped(amount)} ₴`;
}

export function formatEur(amountUah: number, uahPerEur: number, _locale?: string) {
  return `${grouped(amountUah / uahPerEur)} €`;
}

export function uahToKop(amountUah: number) {
  return Math.round(amountUah * 100);
}
