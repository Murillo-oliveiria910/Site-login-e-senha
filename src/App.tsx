import { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  ClipboardList, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  RefreshCw, 
  SlidersHorizontal, 
  AlertTriangle,
  Moon,
  Sun,
  Hammer,
  User,
  Activity,
  Archive,
  Info
} from 'lucide-react';
import { LoggedInUser, Ticket, TicketPriority } from './types';
import { TicketService } from './ticketService';
import { isSupabaseConfigured } from './supabaseClient';
import LoginCard from './components/LoginCard';
import TicketItem from './components/TicketItem';
import CreateTicketForm from './components/CreateTicketForm';
import ConnectionBadge from './components/ConnectionBadge';

export default function App() {
  // Session / Authentication state
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => {
    const saved = localStorage.getItem('sistema_chamados_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Ticket data state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | undefined>(undefined);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('todos');
  const [selectedPriority, setSelectedPriority] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'aberto' | 'encerrado'>('todos');

  // UI state controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ativos' | 'arquivados'>('ativos');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sistema_chamados_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Notification Toast state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync notification effect
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const result = await TicketService.getTickets();
      setTickets(result.tickets);
      setIsUsingSupabase(result.isUsingSupabase);
      setSupabaseErrorMsg(result.error);
    } catch (err: any) {
      showNotification('Houve um problema ao carregar os chamados.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and theme setup
  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sistema_chamados_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sistema_chamados_theme', 'light');
    }
  }, [darkMode]);

  // Handle Login
  const handleLogin = (user: LoggedInUser) => {
    setCurrentUser(user);
    localStorage.setItem('sistema_chamados_user_session', JSON.stringify(user));
    showNotification(`Bem-vindo, ${user.name}! Login como ${user.role}.`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sistema_chamados_user_session');
    showNotification('Sessão encerrada com sucesso.', 'info');
  };

  // Create new ticket action
  const handleCreateTicket = async (ticketData: { title: string; description: string; priority: TicketPriority; sector: string }) => {
    if (!currentUser) return;
    try {
      const response = await TicketService.createTicket({
        ...ticketData,
        operator_username: currentUser.username,
      });

      if (response.error) {
        showNotification(response.error, 'info');
      } else {
        showNotification('Novo chamado aberto com sucesso!', 'success');
      }

      // Re-fetch to get newest list
      await fetchTickets();
    } catch (err: any) {
      showNotification(err.message || 'Falha ao gravar chamado.', 'error');
      throw err;
    }
  };

  // Close ticket action (Mechanic only)
  const handleCloseTicket = async (id: string, resolution: string) => {
    if (!currentUser || currentUser.role !== 'mecanico') {
      showNotification('Apenas mecânicos possuem autorização para encerrar chamados.', 'error');
      return;
    }

    try {
      const response = await TicketService.closeTicket(id, currentUser.username, resolution);
      
      if (response.error) {
         showNotification(response.error, 'info');
      } else {
         showNotification('Chamado encerrado e relatório técnico salvo!', 'success');
      }

      await fetchTickets();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao atualizar chamado.', 'error');
      throw err;
    }
  };

  // Reset local database for local testing
  const handleResetLocal = () => {
    const fresh = TicketService.resetLocalTickets();
    setTickets(fresh);
    setIsUsingSupabase(false);
    setSupabaseErrorMsg(undefined);
    showNotification('Banco de dados local restaurado para os valores de fábrica!', 'success');
  };

  // Dynamic Sectors list extracted from current tickets for filter dropdown
  const uniqueSectors = useMemo(() => {
    const list = tickets.map(t => t.sector);
    // Add default presets too in case they aren't created yet
    const presets = [
      'Mecânica Industrial',
      'Elétrica & Automação',
      'Hidráulica & Pneumática',
      'Caldeiraria & Solda',
      'Utilidades & Climatização',
      'Segurança do Trabalho',
      'Infraestrutura Predial'
    ];
    return Array.from(new Set([...list, ...presets])).filter(Boolean);
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesOperator = t.operator_username.toLowerCase().includes(query);
        const matchesMechanic = t.mechanic_username?.toLowerCase().includes(query) || false;
        const matchesRes = t.resolution?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesOperator && !matchesMechanic && !matchesRes) {
          return false;
        }
      }

      // 2. Sector Match
      if (selectedSector !== 'todos' && t.sector !== selectedSector) {
        return false;
      }

      // 3. Priority Match
      if (selectedPriority !== 'todos' && t.priority !== selectedPriority) {
        return false;
      }

      // 4. Status Match
      if (selectedStatus !== 'todos' && t.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, selectedSector, selectedPriority, selectedStatus]);

  // Stats Counters
  const counters = useMemo(() => {
    const total = tickets.length;
    const abertos = tickets.filter(t => t.status === 'aberto').length;
    const encerrados = tickets.filter(t => t.status === 'encerrado').length;
    const urgentes = tickets.filter(t => t.status === 'aberto' && t.priority === 'alta').length;

    return { total, abertos, encerrados, urgentes };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      
      {/* Toast Notification */}
      {notification && (
        <div 
          id="toast-notification"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border transition-all duration-300 max-w-sm animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-indigo-600 text-white border-indigo-500'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          <div className="text-xs font-semibold leading-relaxed">
            {notification.message}
          </div>
        </div>
      )}

      {/* Header element */}
      <header id="app-header" className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/15">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">CHAMADOS</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-md ml-2 border border-indigo-500/25">Linha Viva</span>
            </div>
          </div>

          {/* User Controls and Theme Badge */}
          <div className="flex items-center gap-3">
            <ConnectionBadge isRealTime={isUsingSupabase} dbMessage={supabaseErrorMsg} />
            
            <button
              type="button"
              id="btn-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Alternar Tema Escuro"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 pl-3 pr-2 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {currentUser.username === 'operador' ? '📦 Operador' : '🔧 Mecânico'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {currentUser.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1 px-2.5 bg-zinc-200/60 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-zinc-700 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all ml-1.5 cursor-pointer"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!currentUser ? (
          /* User Logged Out: Display Centered Auth */
          <div className="h-[75vh] flex flex-col justify-center items-center">
            <LoginCard 
              onLoginSuccess={handleLogin}
              isRealTime={isUsingSupabase}
              dbMessage={supabaseErrorMsg}
            />
          </div>
        ) : (
          /* User Logged In: Core Dashboard */
          <div className="space-y-6">
            
            {/* Operator/Mechanic Interactive Intro Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${currentUser.role === 'operador' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {currentUser.role === 'operador' ? <User className="w-6 h-6" /> : <Hammer className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold dark:text-white">
                      Olá, {currentUser.name}!
                    </h2>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      currentUser.role === 'operador' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
                    {currentUser.role === 'operador' 
                      ? 'Registre anomalias de equipamentos e abra ordens de manutenção.' 
                      : 'Monitore chamados e registre laudos de conserto técnicos.'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons based on User Role */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {currentUser.role === 'operador' && (
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    id="btn-open-create-ticket"
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Abrir Novo Chamado</span>
                  </button>
                )}

                {/* Local Fallback Warning / DB Reset */}
                {!isUsingSupabase && (
                  <button
                    type="button"
                    onClick={handleResetLocal}
                    className="flex items-center gap-1.5 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-2xl transition-all cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50 w-full sm:w-auto justify-center"
                    title="Restaurar chamados locais para demonstração de teste"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Redefinir Demostração</span>
                  </button>
                )}

                {/* Mobile visible logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="sm:hidden flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl transition-all w-full cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>

            {/* Statistics Row Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-dashboard-grid">
              
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hidden sm:block">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Geral</span>
                  <span className="text-xl sm:text-2xl font-extrabold dark:text-white mt-1 block">{counters.total}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hidden sm:block animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Em Aberto</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">{counters.abertos}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hidden sm:block">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolvidos</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{counters.encerrados}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hidden sm:block">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Urgentes (Manutenção)</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-rose-500 mt-1 block">{counters.urgentes}</span>
                </div>
              </div>

            </div>

            {/* Core Ticket Manager - Filter Controls & Listings */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              
              {/* Filter controls panel */}
              <div className="p-5 md:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="flex flex-col gap-4">
                  
                  {/* Title & Refresh Button */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                      <span>Filtros & Filtro Avançado</span>
                    </h3>
                    <button
                      type="button"
                      onClick={fetchTickets}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold py-1 px-2.5 rounded-lg hover:bg-indigo-500/5 transition z-10 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Sincronizando...' : 'Sincronizar'}</span>
                    </button>
                  </div>

                  {/* Operational Settings Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar chamado..."
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {/* Sector filter */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase ml-1 shrink-0">Setor</span>
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full bg-transparent text-xs py-2 text-zinc-700 dark:text-zinc-200 focus:outline-none font-medium cursor-pointer"
                      >
                        <option value="todos">Todos setores</option>
                        {uniqueSectors.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority filter */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase ml-1 shrink-0">Urgência</span>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full bg-transparent text-xs py-2 text-zinc-700 dark:text-zinc-200 focus:outline-none font-medium cursor-pointer"
                      >
                        <option value="todos">Todas criticidades</option>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase ml-1 shrink-0">Status</span>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        className="w-full bg-transparent text-xs py-2 text-zinc-700 dark:text-zinc-200 focus:outline-none font-medium cursor-pointer"
                      >
                        <option value="todos">Todos chamados</option>
                        <option value="aberto">Apenas Abertos</option>
                        <option value="encerrado">Apenas Encerrados</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>

              {/* Tickets list box container */}
              <div className="p-5 md:p-6" id="tickets-list-area">
                
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    <p className="text-sm font-medium text-zinc-500">Sincronizando com a base de dados...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <ClipboardList className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Nenhum chamado encontrado</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Experimente alterar os termos da busca, limpar os setores ou abrir um novo chamado caso seja operador.
                    </p>
                    {(selectedSector !== 'todos' || selectedPriority !== 'todos' || selectedStatus !== 'todos' || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSector('todos');
                          setSelectedPriority('todos');
                          setSelectedStatus('todos');
                        }}
                        className="mt-4 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-xl border border-indigo-500/25 cursor-pointer"
                      >
                        Limpar todos os filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((t) => (
                      <TicketItem
                        key={t.id}
                        ticket={t}
                        currentUserRole={currentUser.role}
                        currentUsername={currentUser.username}
                        onCloseTicket={handleCloseTicket}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>

            {/* Operator Creation form modal popup */}
            {isCreateOpen && (
              <CreateTicketForm 
                onTicketCreated={handleCreateTicket}
                onClose={() => setIsCreateOpen(false)}
              />
            )}

          </div>
        )}

      </main>

      {/* Solid manufacturing footer layout info */}
      <footer className="mt-auto py-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sistema CNC de Chamados</span>
            <span>- Painel Integrado de Manutenção Coletiva</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            © 2026 Operação de Linha Industrial. Licenciado para uso regulamentar interno de operadores e mecânicos.
          </div>
        </div>
      </footer>
    </div>
  );
}
