import { describe, it, expect, mock } from "bun:test";
import {
  selectNextTicket,
  calculateServiceCommission,
  onBarberReady,
  onServiceCompleted,
  getActiveQueue,
} from "./queueEngine";
import type { QueueStrategy, BarberWorkStatus } from "../types";

describe("Queue Engine - selectNextTicket (Pure Algorithm)", () => {
  const barberA = "barber-uuid-111";
  const barberB = "barber-uuid-222";

  const baseDate = new Date("2026-11-15T10:00:00Z").getTime();

  it("LOYALTY_PRIORITY: selects ticket requesting the barber first, even if a free ticket arrived earlier", () => {
    const queue = [
      {
        id: "ticket-free-1",
        ticketNumber: "TKT-001",
        requestedBarberId: null, // Pelanggan bebas
        createdAt: new Date(baseDate),
      },
      {
        id: "ticket-req-a",
        ticketNumber: "TKT-002",
        requestedBarberId: barberA, // Pelanggan minta Barber A
        createdAt: new Date(baseDate + 5 * 60 * 1000), // Datang 5 menit lebih lambat
      },
    ];

    const chosen = selectNextTicket(queue, barberA, "LOYALTY_PRIORITY");
    expect(chosen).not.toBeNull();
    expect(chosen?.id).toBe("ticket-req-a");
    expect(chosen?.ticketNumber).toBe("TKT-002");
  });

  it("LOYALTY_PRIORITY: selects oldest requested ticket when multiple customers requested the same barber", () => {
    const queue = [
      {
        id: "ticket-req-a-old",
        ticketNumber: "TKT-001",
        requestedBarberId: barberA,
        createdAt: new Date(baseDate),
      },
      {
        id: "ticket-req-a-new",
        ticketNumber: "TKT-002",
        requestedBarberId: barberA,
        createdAt: new Date(baseDate + 2 * 60 * 1000),
      },
    ];

    const chosen = selectNextTicket(queue, barberA, "LOYALTY_PRIORITY");
    expect(chosen?.id).toBe("ticket-req-a-old");
  });

  it("LOYALTY_PRIORITY Fallback: selects oldest free ticket if nobody requested the barber", () => {
    const queue = [
      {
        id: "ticket-free-old",
        ticketNumber: "TKT-001",
        requestedBarberId: null,
        createdAt: new Date(baseDate),
      },
      {
        id: "ticket-free-new",
        ticketNumber: "TKT-002",
        requestedBarberId: null,
        createdAt: new Date(baseDate + 3 * 60 * 1000),
      },
    ];

    const chosen = selectNextTicket(queue, barberA, "LOYALTY_PRIORITY");
    expect(chosen?.id).toBe("ticket-free-old");
  });

  it("LOYALTY_PRIORITY: does NOT steal tickets requested for other barbers (returns null if only other barber requests exist)", () => {
    const queue = [
      {
        id: "ticket-req-b",
        ticketNumber: "TKT-001",
        requestedBarberId: barberB, // Khusus Barber B
        createdAt: new Date(baseDate),
      },
    ];

    // Barber A is ready, but queue only has a customer who specifically asked for Barber B
    const chosenForA = selectNextTicket(queue, barberA, "LOYALTY_PRIORITY");
    expect(chosenForA).toBeNull();

    // But when Barber B is ready, Barber B gets it immediately
    const chosenForB = selectNextTicket(queue, barberB, "LOYALTY_PRIORITY");
    expect(chosenForB?.id).toBe("ticket-req-b");
  });

  it("STRICT_FIFO: always picks the oldest ticket, ignoring requested barber preference", () => {
    const queue = [
      {
        id: "ticket-oldest-for-b",
        ticketNumber: "TKT-001",
        requestedBarberId: barberB, // Me-request Barber B
        createdAt: new Date(baseDate),
      },
      {
        id: "ticket-newer-for-a",
        ticketNumber: "TKT-002",
        requestedBarberId: barberA, // Me-request Barber A
        createdAt: new Date(baseDate + 10 * 60 * 1000),
      },
    ];

    // Under STRICT_FIFO, Barber A gets the oldest ticket in queue regardless
    const chosenForA = selectNextTicket(queue, barberA, "STRICT_FIFO");
    expect(chosenForA?.id).toBe("ticket-oldest-for-b");
    expect(chosenForA?.ticketNumber).toBe("TKT-001");
  });

  it("Returns null when queue is empty", () => {
    expect(selectNextTicket([], barberA, "LOYALTY_PRIORITY")).toBeNull();
    expect(selectNextTicket([], barberA, "STRICT_FIFO")).toBeNull();
  });
});

describe("Queue Engine - calculateServiceCommission", () => {
  it("calculates commission strictly from SERVICE items and ignores PRODUCT items", () => {
    const items = [
      { itemType: "SERVICE", subtotal: 60000, price: 60000, quantity: 1 },
      { itemType: "PRODUCT", subtotal: 100000, price: 100000, quantity: 1 }, // Pomade
    ];

    // Barber commission is 50%
    const commission = calculateServiceCommission(items, 50);
    // 50% of 60,000 = 30,000
    expect(commission).toBe(30000);
  });

  it("uses fallbackSubtotal when ticket has no line items", () => {
    const commission = calculateServiceCommission([], 40, 50000);
    // 40% of 50,000 = 20,000
    expect(commission).toBe(20000);
  });

  it("handles decimal commission percentages properly", () => {
    const items = [{ itemType: "SERVICE", subtotal: 45000 }];
    const commission = calculateServiceCommission(items, 33.33);
    // 45,000 * 0.3333 = 14998.5
    expect(commission).toBe(14998.5);
  });
});

describe("Queue Engine - Database Service: onBarberReady", () => {
  it("assigns ticket and sets barber to BUSY when waiting ticket is available (LOYALTY_PRIORITY)", async () => {
    const storeId = "store-1";
    const barberId = "barber-1";

    const mockTicket = {
      id: "ticket-101",
      ticketNumber: "TKT-101",
      storeId,
      requestedBarberId: barberId,
      serviceStatus: "WAITING",
    };

    const mockPrisma = {
      store: {
        findUnique: mock(() => Promise.resolve({ queueStrategy: "LOYALTY_PRIORITY" })),
      },
      barberProfile: {
        findUnique: mock(() =>
          Promise.resolve({ id: barberId, storeId, workStatus: "READY" })
        ),
        findFirst: mock(() => null),
        update: mock(({ data }: any) => Promise.resolve({ id: barberId, ...data })),
      },
      ticket: {
        findFirst: mock(({ where }: any) => {
          if (where.requestedBarberId === barberId) {
            return Promise.resolve(mockTicket);
          }
          return Promise.resolve(null);
        }),
        update: mock(({ data }: any) =>
          Promise.resolve({
            ...mockTicket,
            ...data,
          })
        ),
      },
    };

    const result = await onBarberReady(storeId, barberId, mockPrisma);

    expect(result.assigned).toBe(true);
    expect(result.ticket?.id).toBe("ticket-101");
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-101" },
      data: {
        assignedBarberId: barberId,
        serviceStatus: "IN_SERVICE",
      },
      include: expect.any(Object),
    });
    expect(mockPrisma.barberProfile.update).toHaveBeenCalledWith({
      where: { id: barberId },
      data: { workStatus: "BUSY" },
    });
  });

  it("sets barber to READY and updates lastReadyAt when no tickets are waiting", async () => {
    const storeId = "store-1";
    const barberId = "barber-1";

    const mockPrisma = {
      store: {
        findUnique: mock(() => Promise.resolve({ queueStrategy: "LOYALTY_PRIORITY" })),
      },
      barberProfile: {
        findUnique: mock(() =>
          Promise.resolve({ id: barberId, storeId, workStatus: "BUSY" })
        ),
        findFirst: mock(() => null),
        update: mock(({ data }: any) => Promise.resolve({ id: barberId, ...data })),
      },
      ticket: {
        findFirst: mock(() => Promise.resolve(null)),
        update: mock(() => Promise.resolve({})),
      },
    };

    const result = await onBarberReady(storeId, barberId, mockPrisma);

    expect(result.assigned).toBe(false);
    expect(result.ticket).toBeNull();
    expect(mockPrisma.barberProfile.update).toHaveBeenCalledWith({
      where: { id: barberId },
      data: {
        workStatus: "READY",
        lastReadyAt: expect.any(Date),
      },
    });
  });
});

describe("Queue Engine - Database Service: onServiceCompleted", () => {
  const storeId = "store-1";
  const barberId = "barber-1";
  const ticketId = "ticket-202";

  it("completes service, calculates commission, sets closedAt if PAID, and transitions to READY (auto-plot)", async () => {
    const mockBarber = {
      id: barberId,
      storeId,
      serviceCommissionPct: 50,
      workStatus: "BUSY",
    };

    const mockTicket = {
      id: ticketId,
      ticketNumber: "TKT-202",
      storeId,
      paymentStatus: "PAID",
      serviceStatus: "IN_SERVICE",
      subtotal: 50000,
      items: [{ itemType: "SERVICE", subtotal: 50000 }],
      commissionLedgers: [],
    };

    const createdLedger: any[] = [];

    const mockPrisma: any = {
      ticket: {
        findUnique: mock(() => Promise.resolve(mockTicket)),
        update: mock(({ data }: any) => Promise.resolve({ ...mockTicket, ...data })),
        findFirst: mock(() => Promise.resolve(null)), // In onBarberReady: no waiting tickets
      },
      barberProfile: {
        findUnique: mock(() => Promise.resolve(mockBarber)),
        findFirst: mock(() => null),
        update: mock(({ data }: any) => Promise.resolve({ ...mockBarber, ...data })),
      },
      store: {
        findUnique: mock(() => Promise.resolve({ queueStrategy: "LOYALTY_PRIORITY" })),
      },
      dailyRegister: {
        findFirst: mock(() => Promise.resolve({ id: "reg-1", status: "OPEN" })),
      },
      commissionLedger: {
        create: mock(({ data }: any) => {
          createdLedger.push(data);
          return Promise.resolve({ id: "ledger-1", ...data });
        }),
      },
    };

    const result = await onServiceCompleted(
      storeId,
      ticketId,
      barberId,
      "READY",
      mockPrisma
    );

    expect(result.success).toBe(true);
    expect(result.nextStatus).toBe("READY");

    // Ticket updated to COMPLETED with closedAt because it's PAID
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ticketId },
        data: expect.objectContaining({
          serviceStatus: "COMPLETED",
          closedAt: expect.any(Date),
        }),
      })
    );

    // Commission recorded in CommissionLedger: 50% of 50000 = 25000
    expect(createdLedger.length).toBe(1);
    expect(createdLedger[0].barberId).toBe(barberId);
    expect(createdLedger[0].amount).toBe(25000);
    expect(createdLedger[0].sourceType).toBe("SERVICE_FEE");

    // Since nextStatus === READY and no tickets waiting, barber becomes READY
    expect(mockPrisma.barberProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: barberId },
        data: expect.objectContaining({
          workStatus: "READY",
        }),
      })
    );
  });

  it("transitions barber to BREAK without auto-assigning next customer", async () => {
    const mockBarber = {
      id: barberId,
      storeId,
      serviceCommissionPct: 50,
      workStatus: "BUSY",
    };

    const mockTicket = {
      id: ticketId,
      ticketNumber: "TKT-202",
      storeId,
      paymentStatus: "UNPAID",
      serviceStatus: "IN_SERVICE",
      subtotal: 40000,
      items: [{ itemType: "SERVICE", subtotal: 40000 }],
      commissionLedgers: [],
    };

    const mockPrisma: any = {
      ticket: {
        findUnique: mock(() => Promise.resolve(mockTicket)),
        update: mock(({ data }: any) => Promise.resolve({ ...mockTicket, ...data })),
      },
      barberProfile: {
        findUnique: mock(() => Promise.resolve(mockBarber)),
        findFirst: mock(() => null),
        update: mock(({ data }: any) => Promise.resolve({ ...mockBarber, ...data })),
      },
      store: {
        findUnique: mock(() => Promise.resolve({ queueStrategy: "LOYALTY_PRIORITY" })),
      },
      dailyRegister: {
        findFirst: mock(() => null),
      },
      commissionLedger: {
        create: mock(({ data }: any) => Promise.resolve({ id: "ledger-2", ...data })),
      },
    };

    const result = await onServiceCompleted(
      storeId,
      ticketId,
      barberId,
      "BREAK",
      mockPrisma
    );

    expect(result.success).toBe(true);
    expect(result.nextStatus).toBe("BREAK");

    // Since paymentStatus is UNPAID, closedAt should NOT be set
    const updateCall = mockPrisma.ticket.update.mock.calls[0][0];
    expect(updateCall.data.closedAt).toBeUndefined();

    // Barber updated to BREAK
    expect(mockPrisma.barberProfile.update).toHaveBeenCalledWith({
      where: { id: barberId },
      data: { workStatus: "BREAK" },
    });
  });
});

describe("Queue Engine - getActiveQueue", () => {
  it("structures in-service, waiting tickets, and barber stations properly", async () => {
    const storeId = "store-1";
    const mockBarbers = [
      {
        id: "barber-1",
        workStatus: "BUSY",
        user: { id: "u-1", name: "Dedi Capster", phone: "08123" },
      },
      {
        id: "barber-2",
        workStatus: "READY",
        user: { id: "u-2", name: "Budi Fade", phone: "08124" },
      },
    ];

    const mockInService = [
      {
        id: "tkt-in-1",
        assignedBarberId: "barber-1",
        serviceStatus: "IN_SERVICE",
        createdAt: new Date(),
      },
    ];

    const mockWaiting = [
      {
        id: "tkt-wait-1",
        serviceStatus: "WAITING",
        createdAt: new Date(),
      },
    ];

    const mockPrisma: any = {
      ticket: {
        findMany: mock(({ where }: any) => {
          if (where.serviceStatus === "IN_SERVICE") return Promise.resolve(mockInService);
          if (where.serviceStatus === "WAITING") return Promise.resolve(mockWaiting);
          return Promise.resolve([]);
        }),
      },
      barberProfile: {
        findMany: mock(() => Promise.resolve(mockBarbers)),
      },
    };

    const activeQueue = await getActiveQueue(storeId, mockPrisma);

    expect(activeQueue.inServiceTickets.length).toBe(1);
    expect(activeQueue.waitingTickets.length).toBe(1);
    expect(activeQueue.readyBarbers.length).toBe(1);
    expect(activeQueue.readyBarbers[0].id).toBe("barber-2");

    expect(activeQueue.stations.length).toBe(2);
    expect(activeQueue.stations[0].chairNumber).toBe(1);
    expect(activeQueue.stations[0].currentTicket?.id).toBe("tkt-in-1");
    expect(activeQueue.stations[1].chairNumber).toBe(2);
    expect(activeQueue.stations[1].currentTicket).toBeNull();
  });
});
