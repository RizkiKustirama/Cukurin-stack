/**
 * Utilitas pemformatan mata uang dan waktu sesuai standar Cukurin
 * Mata uang: Format Rupiah standar di UI: Rp 40.000
 * Waktu: Konversi timestamp UTC ke WIB (Asia/Jakarta, UTC+7)
 */

export function formatRupiah(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatWIB(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(d);
}
