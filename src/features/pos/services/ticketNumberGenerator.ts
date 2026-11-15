import { rawPrisma } from "@/shared/db";

/**
 * Mendapatkan batas awal dan akhir hari berdasarkan zona waktu WIB (Asia/Jakarta, UTC+7)
 */
export function getWIBDateBounds(date: Date = new Date()): {
  dateString: string;
  startOfDay: Date;
  endOfDay: Date;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // formatter menghasilkan string "YYYY-MM-DD"
  const [year, month, day] = formatter.format(date).split("-");
  const dateString = `${year}${month}${day}`;

  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999+07:00`);

  return { dateString, startOfDay, endOfDay };
}

/**
 * Menghasilkan nomor tiket transaksi harian per toko.
 * Format: TKT-YYYYMMDD-XXX (contoh: TKT-20261116-001)
 */
export async function generateTicketNumber(storeId: string): Promise<string> {
  const { dateString, startOfDay, endOfDay } = getWIBDateBounds();

  const countToday = await rawPrisma.ticket.count({
    where: {
      storeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = String(countToday + 1).padStart(3, "0");
  return `TKT-${dateString}-${sequence}`;
}
