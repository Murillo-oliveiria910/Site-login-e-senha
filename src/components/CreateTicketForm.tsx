import React, { useState } from 'react';
import { TicketPriority } from '../types';
import { PlusCircle, ClipboardList, FileWarning, Tag, Layers, X } from 'lucide-react';

interface CreateTicketFormProps {
  onTicketCreated: (data: { title: string; description: string; priority: TicketPriority; sector: string }) => Promise<void>;
  onClose: () => void;
}

const SECTOR_PRESETS = [
  'Mecânica Industrial',
  'Elétrica & Automação',
  'Hidráulica & Pneumática',
  'Caldeiraria & Solda',
  'Utilidades & Climatização',
  'Segurança do Trabalho',
  'Infraestrutura Predial'
];

export default function CreateTicketForm({ onTicketCreated, onClose }: CreateTicketFormProps) {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState(SECTOR_PRESETS[0]);
  const [customSector, setCustomSector] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('media');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!title.trim()) {
      setErrorText('Por favor, informe o título do chamado.');
      return;
    }
    if (!description.trim()) {
      setErrorText('Escreva uma descrição detalhada relatando o ocorrido.');
      return;
    }

    const finalSector = sector === 'Outro' ? (customSector.trim() || 'Outro') : sector;

    setIsSubmitting(true);
    try {
      await onTicketCreated({
        title: title.trim(),
        description: description.trim(),
        priority,
        sector: finalSector,
      });
      // Reset inputs
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao criar o chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="modal-create-ticket" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 dark:bg-zinc-950 rounded-lg">
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-950 dark:text-zinc-50 text-base">
                Abrir Novo Chamado Técnico
              </h3>
              <p className="text-[11px] text-zinc-500">Insira as informações do equipamento ou setor com avaria</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4" id="form-create-ticket-real">
          {errorText && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200/50 dark:border-red-950/40">
              {errorText}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Título do Chamado *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <FileWarning className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                id="ticket-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aquecimento excessivo no motor da serra de fita"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Setor / Área de Manutenção
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Tag className="w-4 h-4" />
                </span>
                <select
                  id="ticket-sector-select"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                >
                  {SECTOR_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Outro">Outro (Digitar manualmente)</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Prioridade do Chamado
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Layers className="w-4 h-4" />
                </span>
                <select
                  id="ticket-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                >
                  <option value="baixa">Baixa (Pode aguardar)</option>
                  <option value="media">Média (Recomendável no turno)</option>
                  <option value="alta">Alta (Urgente / Máquina Parada)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Sector if chosen Outro */}
          {sector === 'Outro' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Especifique o Setor
              </label>
              <input
                type="text"
                required
                id="ticket-custom-sector"
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Ex: Refeitório ou expedição"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Informações Descritivas detalhadas *
            </label>
            <textarea
              id="ticket-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indique os sintomas, código de malha do painel, comportamentos observados, ruídos atípicos ou qualquer informação útil para o técnico..."
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-create-ticket-real"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Gravando Chamado...' : 'Gravar e Abrir Chamado'}
          </button>
        </div>
      </div>
    </div>
  );
}
