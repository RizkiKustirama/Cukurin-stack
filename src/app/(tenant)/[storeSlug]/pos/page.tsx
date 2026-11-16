import { notFound } from "next/navigation";
import { requireAuth } from "@/shared/auth";
import { rawPrisma } from "@/shared/db";
import { PosCashierView } from "@/features/pos";
import { BarberWorkStatus, ServiceStatus, PaymentStatus } from "@prisma/client";
import {
  getStoreVaultInfo,
  calculateRegisterSummary,
  getCashMovements,
} from "@/features/cash-register/services/cashRegisterService";
import { getStoreBarberPayoutCandidates } from "@/features/payroll/services/payrollService";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantPOSPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["OWNER", "MANAGER", "CASHIER", "SUPERADMIN"]);

  // 1. Fetch Tenant & Store Data
  const tenant = await rawPrisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: {
      stores: {
        take: 1,
        include: {
          services: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
          products: {
            where: { isActive: true },
            orderBy: { name: "asc" },
          },
          dailyRegisters: {
            where: { status: "OPEN" },
            orderBy: { openedAt: "desc" },
            take: 1,
            include: {
              payments: true,
              pettyCashExpenses: true,
            },
          },
          barberProfiles: {
            include: {
              user: true,
              assignedTickets: {
                where: { serviceStatus: ServiceStatus.IN_SERVICE },
                include: {
                  customer: true,
                  items: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!tenant || tenant.stores.length === 0) {
    notFound();
  }

  const store = tenant.stores[0];

  // 2. Fetch Tickets for the Store
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeTickets = await rawPrisma.ticket.findMany({
    where: {
      storeId: store.id,
      createdAt: { gte: today },
      serviceStatus: { in: [ServiceStatus.WAITING, ServiceStatus.IN_SERVICE] },
    },
    include: {
      customer: true,
      items: true,
      assignedBarber: { include: { user: true } },
      requestedBarber: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const unpaidTicketsData = await rawPrisma.ticket.findMany({
    where: {
      storeId: store.id,
      paymentStatus: PaymentStatus.UNPAID,
      createdAt: { gte: today },
    },
    include: {
      customer: true,
      items: true,
      assignedBarber: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 3. Format Barbers and Chairs
  const barbersData = store.barberProfiles.map((bp) => {
    const currentTicket = bp.assignedTickets[0];
    return {
      id: bp.id,
      userId: bp.userId,
      name: bp.user.name,
      phone: bp.user.phone,
      workStatus: bp.workStatus,
      currentTicket: currentTicket
        ? {
            id: currentTicket.id,
            ticketNumber: currentTicket.ticketNumber,
            customerName: currentTicket.customer?.name || "Pelanggan",
            serviceName: currentTicket.items[0]?.itemName || "Potong Rambut",
            startedAt: currentTicket.createdAt,
          }
        : null,
    };
  });

  const chairsData = barbersData.map((b, idx) => ({
    chairNumber: idx + 1,
    barberId: b.id,
    barberName: b.name,
    workStatus: b.workStatus,
    ticket: b.currentTicket
      ? {
          id: b.currentTicket.id,
          ticketNumber: b.currentTicket.ticketNumber,
          customerName: b.currentTicket.customerName,
          serviceName: b.currentTicket.serviceName || "Potong Rambut",
          subtotal: 50000,
          paymentStatus: "UNPAID" as const,
          startedAt: b.currentTicket.startedAt,
        }
      : null,
  }));

  // 4. Format Queue
  const waitingTickets = activeTickets.filter(
    (t) => t.serviceStatus === ServiceStatus.WAITING
  );

  const queueData = waitingTickets.map((t) => {
    const minutesAgo = Math.max(
      1,
      Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 60000)
    );
    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      customerName: t.customer?.name || "Pelanggan",
      customerPhone: t.customer?.phone,
      serviceNames: t.items.map((it) => it.itemName),
      totalAmount: Number(t.totalAmount),
      paymentStatus: t.paymentStatus as "UNPAID" | "PAID",
      requestedBarberName: t.requestedBarber?.user.name || null,
      waitingMinutes: minutesAgo,
      createdAt: t.createdAt,
    };
  });

  // 5. Daily Register Cash Calculation & Fase 4 Cash Module
  const activeRegister = store.dailyRegisters[0];
  const activeSummary = activeRegister
    ? await calculateRegisterSummary(activeRegister.id)
    : null;
  const movements = activeRegister
    ? await getCashMovements(activeRegister.id)
    : [];

  const vaultInfo =
    (await getStoreVaultInfo(store.id)) || {
      storeId: store.id,
      storeName: store.name,
      vaultBalance: Number(store.vaultBalance || 0),
    };

  const payoutCandidates = await getStoreBarberPayoutCandidates(store.id);

  const calculatedCash = activeSummary
    ? activeSummary.expectedDrawerCash
    : 0;

  // 6. Master Services & Products
  const servicesData = store.services.map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    durationMinutes: s.durationMinutes,
  }));

  const productsData = store.products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.sellingPrice),
    stockQty: p.stockQuantity,
  }));

  const unpaidFormatted = unpaidTicketsData.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    customerName: t.customer?.name || "Pelanggan",
    barberName: t.assignedBarber?.user.name,
    subtotal: Number(t.subtotal),
    items: t.items.map((it) => ({
      name: it.itemName,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  }));

  return (
    <PosCashierView
      storeSlug={storeSlug}
      storeName={store.name}
      brandName={tenant.brandName || tenant.name}
      user={{
        name: session.name,
        role: session.role,
        email: session.email,
        phone: session.phone,
      }}
      drawer={{
        status: activeRegister ? "OPEN" : "CLOSED",
        cash: calculatedCash,
        openedAt: activeRegister?.openedAt.toISOString(),
      }}
      barbers={barbersData}
      chairs={chairsData}
      queue={queueData}
      services={servicesData}
      products={productsData}
      unpaidTickets={unpaidFormatted}
      storeVault={vaultInfo}
      activeSummary={activeSummary}
      cashMovements={movements}
      payoutCandidates={payoutCandidates}
      cashierId={session.userId}
    />
  );
}
