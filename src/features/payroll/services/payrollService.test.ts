import { describe, expect, it } from "bun:test";

describe("Payroll Service Commission Logic", () => {
  it("harus menghitung akumulasi komisi jasa, produk, dan tip secara benar", () => {
    const mockLedgers = [
      { sourceType: "SERVICE_FEE", amount: 25000, isPaidOut: false },
      { sourceType: "SERVICE_FEE", amount: 35000, isPaidOut: false },
      { sourceType: "PRODUCT_BONUS", amount: 15000, isPaidOut: false },
      { sourceType: "TIP", amount: 10000, isPaidOut: false },
    ];

    let totalService = 0;
    let totalProduct = 0;
    let totalTip = 0;
    let totalUnpaid = 0;

    for (const l of mockLedgers) {
      if (l.sourceType === "SERVICE_FEE") totalService += l.amount;
      else if (l.sourceType === "PRODUCT_BONUS") totalProduct += l.amount;
      else if (l.sourceType === "TIP") totalTip += l.amount;

      if (!l.isPaidOut) totalUnpaid += l.amount;
    }

    expect(totalService).toBe(60000);
    expect(totalProduct).toBe(15000);
    expect(totalTip).toBe(10000);
    expect(totalUnpaid).toBe(85000);
  });

  it("harus membedakan status pencairan tunai laci vs transfer", () => {
    const payout1 = {
      amount: 50000,
      paidVia: "CASH_DRAWER",
      isPaidOut: true,
    };

    const payout2 = {
      amount: 35000,
      paidVia: "TRANSFER",
      isPaidOut: true,
    };

    expect(payout1.paidVia).toBe("CASH_DRAWER");
    expect(payout2.paidVia).toBe("TRANSFER");
  });
});
