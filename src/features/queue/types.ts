// Feature types for Queue Module
import type {
  Ticket,
  BarberProfile,
  BarberWorkStatus,
  QueueStrategy,
  ServiceStatus,
  PaymentStatus,
  Customer,
  TicketItem,
  User,
  CommissionLedger,
} from "@prisma/client";

export type BarberWithUser = BarberProfile & {
  user: Pick<User, "id" | "name" | "phone" | "role" | "isActive">;
};

export type QueueItemTicket = Ticket & {
  customer?: Customer | null;
  requestedBarber?: (BarberProfile & { user: Pick<User, "name" | "phone"> }) | null;
  assignedBarber?: (BarberProfile & { user: Pick<User, "name" | "phone"> }) | null;
  items?: TicketItem[];
};

export interface BarberStation {
  barber: BarberProfile & {
    name: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  chairNumber: number;
  workStatus: BarberWorkStatus;
  currentTicket?: QueueItemTicket | null;
  startedAt?: Date | string | null;
}

export interface ActiveQueueData {
  inServiceTickets: QueueItemTicket[];
  waitingTickets: QueueItemTicket[];
  readyBarbers: BarberWithUser[];
  stations: BarberStation[];
}

export interface BarberReadyResult {
  assigned: boolean;
  ticket: QueueItemTicket | Ticket | null;
}

export interface ServiceCompletedResult {
  success: boolean;
  ticket: QueueItemTicket | Ticket;
  nextStatus: BarberWorkStatus;
  commissionRecorded?: boolean;
}

export interface NextTicketParams {
  storeId: string;
  barberId: string;
  strategy: QueueStrategy;
}

export interface QueueItem {
  ticket: Ticket;
  customerName: string;
  serviceNames: string[];
  waitingMinutes: number;
  requestedBarberName?: string;
  assignedBarberName?: string;
}

export type {
  Ticket,
  BarberProfile,
  BarberWorkStatus,
  QueueStrategy,
  ServiceStatus,
  PaymentStatus,
  Customer,
  TicketItem,
  CommissionLedger,
};
