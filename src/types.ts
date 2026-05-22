export type TicketStatus = 'aberto' | 'encerrado';
export type TicketPriority = 'baixa' | 'media' | 'alta';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  sector: string;
  created_at: string;
  closed_at: string | null;
  operator_username: string;
  mechanic_username: string | null;
  resolution: string | null;
}

export type UserRole = 'operador' | 'mecanico';

export interface LoggedInUser {
  username: string;
  role: UserRole;
  name: string;
}
