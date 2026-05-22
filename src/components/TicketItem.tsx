import React, { useState } from 'react';
import { Ticket, UserRole } from '../types';
import { Calendar, User, CheckCircle2, AlertCircle, Wrench, ArrowRight, MessageSquareCode, Clock, Tag } from 'lucide-react';

interface TicketItemProps {
  key?: string;
  ticket: Ticket;
  currentUserRole: UserRole;
  currentUsername: string;
  onCloseTicket: (id: string, resolution: string) => Promise<void>;
}

export default function TicketItem({ ticket, currentUserRole, currentUsername, onCloseTicket }: TicketItemProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const getPriorityStyles = (prio: string) => {
    switch (prio) {
      case 'alta':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'media':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'baixa':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      setInlineError('Por favor, descreva detalhadamente a ação corretiva realizada.');
      return;
    }

    setIsSubmitting(true);
    setInlineError(null);
    try {
      await onCloseTicket(ticket.id, resolutionText.trim());
      setIsClosing(false);
      setResolutionText('');
    } catch (err: any) {
      setInlineError(err.message || 'Houve um erro ao encerrar o chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id={`ticket-card-${ticket.id}`}
      className={`border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
        ticket.status === 'aberto'
          ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md'
          : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-90'
      }`}
    >
      {/* Upper Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          {/* Status badge */}
          {ticket.status === 'aberto' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Aberto
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Encerrado
            </span>
          )}

          {/* Priority Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityStyles(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>

        {/* Sector Label */}
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-200/30">
          <Tag className="w-3.5 h-3.5" />
          <span>{ticket.sector}</span>
        </div>
      </div>

      {/* Main Ticket Info */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {ticket.title}
        </h4>
        
        <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Detailed Metadata Footer of Creation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/40 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-zinc-400" />
          <span>Aberto por: <strong>{ticket.operator_username}</strong></span>
        </div>
        <div className="flex items-center gap-2 md:justify-end">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Data: <span>{formatDate(ticket.created_at)}</span></span>
        </div>
      </div>

      {/* Resolution block if closed */}
      {ticket.status === 'encerrado' && ticket.resolution && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/15" id={`resolution-info-${ticket.id}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>AÇÃO REPARADORA (REPARADO POR {ticket.mechanic_username?.toUpperCase()})</span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-medium border-l-2 border-emerald-500/40 pl-3">
            {ticket.resolution}
          </p>
          {ticket.closed_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-2 pl-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Concluído em {formatDate(ticket.closed_at)}</span>
            </div>
          )}
        </div>
      )}

      {/* Mechanic Action Panel */}
      {ticket.status === 'aberto' && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
          {currentUserRole === 'mecanico' ? (
            !isClosing ? (
              <button
                type="button"
                onClick={() => setIsClosing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Encerrar Chamado (Descrever Solução)</span>
              </button>
            ) : (
              <form onSubmit={handleCloseSubmit} className="space-y-3.5 mt-2" id={`form-close-${ticket.id}`}>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquareCode className="w-4 h-4 text-indigo-500" />
                    Descrição do reparo realizado (O que foi feito?)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Ex: Realizei o aperto das conexões hidráulicas soltas e completei o óleo sintético ISO 68 até o nível operacional..."
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                {inlineError && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/50 dark:border-red-950/40">
                    {inlineError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    {isSubmitting ? 'Salvando...' : 'Confirmar Encerramento'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClosing(false);
                      setInlineError(null);
                    }}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs italic bg-zinc-50 dark:bg-zinc-950/50 p-2 rounded-lg border border-zinc-200/20">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Aguardando intervenção do mecânico para encerramento.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
