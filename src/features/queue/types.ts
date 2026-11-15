// Feature types for Queue Module
import type { Ticket, BarberProfile, BarberWorkStatus, QueueStrategy } from "@prisma/client";

export interface QueueItem {
  ticket: Ticket;
  customerName: string;
  serviceNames: string[];
  waitingMinutes: number;
  requestedBarberName?: string;
  assignedBarberName?: string;
}

export interface BarberStation {
  barber: BarberProfile & { name: string };
  workStatus: BarberWorkStatus;
  currentTicket?: Ticket;
}

export interface NextTicketParams {
  storeId: string;
  barberId: string;
  strategy: QueueStrategy;
}

export type { Ticket, BarberProfile, BarberWorkStatus, QueueStrategy };
