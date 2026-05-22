import { Ticket, TicketStatus, TicketPriority } from './types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'sistema_chamados_local_tickets';

// Default initial tickets for demonstration in local mode
const DEFAULT_TICKETS: Ticket[] = [
  {
    id: '1',
    title: 'Vazamento de Óleo Hidráulico',
    description: 'Prensa principal esticadora está vazando óleo na parte inferior do pistão. Risco de queda de pressão.',
    status: 'aberto',
    priority: 'alta',
    sector: 'Manutenção Hidráulica',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4h ago
    closed_at: null,
    operator_username: 'operador',
    mechanic_username: null,
    resolution: null,
  },
  {
    id: '2',
    title: 'Falha Térmica no Painel Elétrico',
    description: 'O disjuntor do setor de embalagem desarmou três vezes consecutivas nas últimas duas horas.',
    status: 'encerrado',
    priority: 'alta',
    sector: 'Elétrica',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8h ago
    closed_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // 7h ago
    operator_username: 'operador',
    mechanic_username: 'mecanico',
    resolution: 'Realizada a troca do disjuntor de 32A por um novo da mesma marca. Corrente testada sob carga máxima e estabilizada em 24A.',
  },
  {
    id: '3',
    title: 'Ruído Excessivo na Esteira 4',
    description: 'Esteira transportadora de caixas fazendo barulho agudo intermitente na polia motora.',
    status: 'aberto',
    priority: 'media',
    sector: 'Mecânica Geral',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // 1h ago
    closed_at: null,
    operator_username: 'operador',
    mechanic_username: null,
    resolution: null,
  }
];

// Helper to get local storage tickets
function getLocalTickets(): Ticket[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
    return DEFAULT_TICKETS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse local tickets', e);
    return DEFAULT_TICKETS;
  }
}

// Helper to save local storage tickets
function saveLocalTickets(tickets: Ticket[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
}

export const TicketService = {
  /**
   * Fetches all tickets, combining or routing to Supabase/Local
   */
  async getTickets(): Promise<{ tickets: Ticket[]; isUsingSupabase: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chamados')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          const mapped: Ticket[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            description: item.description,
            status: item.status as TicketStatus,
            priority: item.priority as TicketPriority,
            sector: item.sector,
            created_at: item.created_at,
            closed_at: item.closed_at,
            operator_username: item.operator_username,
            mechanic_username: item.mechanic_username,
            resolution: item.resolution,
          }));
          return { tickets: mapped, isUsingSupabase: true };
        }
      } catch (err: any) {
        console.warn('Erro ao conectar ao Supabase. Alternando para armazenamento local:', err);
        return { 
          tickets: getLocalTickets(), 
          isUsingSupabase: false, 
          error: `Erro ao buscar do Supabase: ${err.message || 'Tabela "chamados" não foi criada ou permissões insuficientes.'}` 
        };
      }
    }

    return { tickets: getLocalTickets(), isUsingSupabase: false };
  },

  /**
   * Creates a new ticket
   */
  async createTicket(
    ticketData: { title: string; description: string; priority: TicketPriority; sector: string; operator_username: string }
  ): Promise<{ ticket: Ticket; isUsingSupabase: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured) {
      try {
        const newRecord = {
          title: ticketData.title,
          description: ticketData.description,
          status: 'aberto',
          priority: ticketData.priority,
          sector: ticketData.sector,
          operator_username: ticketData.operator_username,
          closed_at: null,
          mechanic_username: null,
          resolution: null,
        };

        const { data, error } = await supabase
          .from('chamados')
          .insert([newRecord])
          .select();

        if (error) {
          throw error;
        }

        if (data && data[0]) {
          const item = data[0];
          const ticket: Ticket = {
            id: String(item.id),
            title: item.title,
            description: item.description,
            status: item.status as TicketStatus,
            priority: item.priority as TicketPriority,
            sector: item.sector,
            created_at: item.created_at,
            closed_at: item.closed_at,
            operator_username: item.operator_username,
            mechanic_username: item.mechanic_username,
            resolution: item.resolution,
          };
          return { ticket, isUsingSupabase: true };
        }
      } catch (err: any) {
        console.warn('Erro ao inserir no Supabase. Salvando localmente:', err);
        // Save local
        const localTickets = getLocalTickets();
        const newTicket: Ticket = {
          id: Math.random().toString(36).substring(2, 9),
          title: ticketData.title,
          description: ticketData.description,
          status: 'aberto',
          priority: ticketData.priority,
          sector: ticketData.sector,
          created_at: new Date().toISOString(),
          closed_at: null,
          operator_username: ticketData.operator_username,
          mechanic_username: null,
          resolution: null,
        };
        saveLocalTickets([newTicket, ...localTickets]);
        return { 
          ticket: newTicket, 
          isUsingSupabase: false, 
          error: `Erro ao salvar no Supabase (${err.message}). Salvo no modo local.` 
        };
      }
    }

    // Default local
    const localTickets = getLocalTickets();
    const newTicket: Ticket = {
      id: Math.random().toString(36).substring(2, 9),
      title: ticketData.title,
      description: ticketData.description,
      status: 'aberto',
      priority: ticketData.priority,
      sector: ticketData.sector,
      created_at: new Date().toISOString(),
      closed_at: null,
      operator_username: ticketData.operator_username,
      mechanic_username: null,
      resolution: null,
    };
    saveLocalTickets([newTicket, ...localTickets]);
    return { ticket: newTicket, isUsingSupabase: false };
  },

  /**
   * Closes a ticket with mechanics report
   */
  async closeTicket(
    id: string,
    mechanicUsername: string,
    resolution: string
  ): Promise<{ ticket: Ticket; isUsingSupabase: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured) {
      try {
        const closedAt = new Date().toISOString();
        const updateData = {
          status: 'encerrado',
          mechanic_username: mechanicUsername,
          resolution: resolution,
          closed_at: closedAt,
        };

        // Try UUID parsing
        let query = supabase.from('chamados').update(updateData);
        
        // Supabase schema may require UUID, if our localized IDs are simple strings like "1", they will fail UUID validation
        // But genuine supabase rows will use UUIDs.
        const { data, error } = await query.eq('id', id).select();

        if (error) {
          throw error;
        }

        if (data && data[0]) {
          const item = data[0];
          const ticket: Ticket = {
            id: String(item.id),
            title: item.title,
            description: item.description,
            status: item.status as TicketStatus,
            priority: item.priority as TicketPriority,
            sector: item.sector,
            created_at: item.created_at,
            closed_at: item.closed_at,
            operator_username: item.operator_username,
            mechanic_username: item.mechanic_username,
            resolution: item.resolution,
          };
          return { ticket, isUsingSupabase: true };
        } else {
          throw new Error('Nenhum registro correspondente foi retornado.');
        }
      } catch (err: any) {
        console.warn('Erro ao atualizar no Supabase. Atualizando localmente:', err);
        const tickets = getLocalTickets();
        const index = tickets.findIndex(t => t.id === id);
        if (index > -1) {
          tickets[index] = {
            ...tickets[index],
            status: 'encerrado',
            mechanic_username: mechanicUsername,
            resolution: resolution,
            closed_at: new Date().toISOString(),
          };
          saveLocalTickets(tickets);
          return { 
            ticket: tickets[index], 
            isUsingSupabase: false, 
            error: `Erro ao fechar no Supabase (${err.message}). Atualizado no modo local.` 
          };
        }
        throw new Error('Chamado não encontrado e falha ao acessar o Supabase.');
      }
    }

    // Default Local
    const tickets = getLocalTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index > -1) {
      tickets[index] = {
        ...tickets[index],
        status: 'encerrado',
        mechanic_username: mechanicUsername,
        resolution: resolution,
        closed_at: new Date().toISOString(),
      };
      saveLocalTickets(tickets);
      return { ticket: tickets[index], isUsingSupabase: false };
    }
    throw new Error('Chamado não encontrado.');
  },

  /**
   * Resets all tickets to default (useful for testing/demo)
   */
  resetLocalTickets(): Ticket[] {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
    return DEFAULT_TICKETS;
  }
};
