import { notFound } from "next/navigation";
import { rawPrisma } from "@/shared/db";
import { PublicQueueDisplay } from "@/features/queue";
import { BarberWorkStatus, ServiceStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantPublicQueuePage({ params }: PageProps) {
  const { storeSlug } = await params;

  // 1. Fetch Tenant & Store Data (Publicly accessible)
  const tenant = await rawPrisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: {
      stores: {
        take: 1,
        include: {
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

  // 2. Fetch Waiting Tickets for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const waitingTickets = await rawPrisma.ticket.findMany({
    where: {
      storeId: store.id,
      serviceStatus: ServiceStatus.WAITING,
      createdAt: { gte: today },
    },
    include: {
      customer: true,
      items: true,
      requestedBarber: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // 3. Format Barber Stations (Chairs 1..N)
  const stationsData = store.barberProfiles.map((bp, idx) => {
    const currentTicket = bp.assignedTickets[0];
    let status: "READY" | "BUSY" | "BREAK" | "OFFLINE" = "OFFLINE";

    if (bp.workStatus === BarberWorkStatus.READY) status = "READY";
    else if (bp.workStatus === BarberWorkStatus.BUSY) status = "BUSY";
    else if (bp.workStatus === BarberWorkStatus.BREAK) status = "BREAK";

    return {
      chairNumber: idx + 1,
      barberName: bp.user.name,
      status,
      ticketNumber: currentTicket?.ticketNumber,
      customerName: currentTicket?.customer?.name || (currentTicket ? "Pelanggan" : undefined),
      serviceName: currentTicket?.items[0]?.itemName || (currentTicket ? "Potong Rambut" : undefined),
      durationMinutes: 30,
    };
  });

  // 4. Format Queue Items (Next in line)
  const queueData = waitingTickets.map((t) => {
    const waitingMinutes = Math.max(
      1,
      Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 60000)
    );

    return {
      ticketNumber: t.ticketNumber,
      customerName: t.customer?.name || "Pelanggan",
      serviceName: t.items.map((i) => i.itemName).join(", ") || "Potong Rambut",
      requestedBarber: t.requestedBarber?.user.name || null,
      waitingMinutes,
    };
  });

  return (
    <PublicQueueDisplay
      storeName={store.name}
      storeSlug={storeSlug}
      stations={stationsData}
      queue={queueData}
    />
  );
}
