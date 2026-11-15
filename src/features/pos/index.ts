// Public API for POS Module
export * from "./types";
export * from "./services/ticketNumberGenerator";

// Core Ticket Actions (Agent-001)
export {
  createTicketAction,
  searchCustomerByPhoneAction,
  settleTicketAction,
  cancelTicketAction,
  getTicketDetailsAction,
  getActiveBarbersAction,
  getStoreCatalogAction,
} from "./actions/ticketActions";

// Cashier POS Actions (Agent-002 & Agent-003)
export {
  createPosFastTicketAction,
  settleTicketPaymentAction,
  changeBarberStatusAction,
  completeHaircutAction,
  callNextToChairAction,
} from "./actions/posActions";

export * from "./components/PosTransactionForm";
export * from "./components/QuickTicketSheet";
export * from "./components/PaymentModal";
export * from "./components/PosCashierView";
export * from "./components/PosDashboardView";
export * from "./components/BarberStatusCarousel";
export * from "./components/StoreHeader";
