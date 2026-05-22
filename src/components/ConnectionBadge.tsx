import { useState } from 'react';
import { Database, HelpCircle, CheckCircle, AlertTriangle, Copy, Check, FileText } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_INSTRUCTIONS } from '../supabaseClient';

interface ConnectionBadgeProps {
  isRealTime: boolean;
  dbMessage?: string;
}

export default function ConnectionBadge({ isRealTime, dbMessage }: ConnectionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_INSTRUCTIONS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        id="btn-connection-status"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 ${
          isSupabaseConfigured && isRealTime
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20'
        }`}
      >
        <Database id="icon-db-badge" className="w-3.5 h-3.5" />
        <span>{isSupabaseConfigured && isRealTime ? 'Supabase Conectado' : 'Banco de Dados Local'}</span>
        <HelpCircle id="icon-help-badge" className="w-3 h-3 ml-0.5 opacity-70" />
      </button>

      {isOpen && (
        <div id="modal-supabase-info" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 text-base">
                  Status de Conexão Supabase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-medium p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {isSupabaseConfigured && isRealTime ? (
                <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-400">Totalmente Integrado!</h4>
                    <p className="mt-1">
                      O aplicativo está se comunicando ativamente com seu projeto Supabase. Os chamados criados e encerrados são salvos diretamente em sua tabela na nuvem.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400">Modo Local Inteligente Ativado</h4>
                    <p className="mt-1">
                      {dbMessage || 'Nenhum par de chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY foi configurado.'}
                    </p>
                    <p className="mt-2 text-xs">
                      Para não interromper seu teste, o sistema salva seus chamados automaticamente no <strong>LocalStorage</strong> do navegador. O aplicativo é 100% interativo e funcional!
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  Como conectar ao seu Supabase do zero:
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-zinc-600 dark:text-zinc-300 text-xs">
                  <li>Crie um projeto gratuito em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">supabase.com</a>.</li>
                  <li>No menu de configurações (ou Secrets do AI Studio), defina as variáveis de ambiente:
                    <div className="my-2 p-2 bg-zinc-100 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                      VITE_SUPABASE_URL=Sua_URL_Do_Supabase<br/>
                      VITE_SUPABASE_ANON_KEY=Sua_Chave_Privada_Anon_Do_Supabase
                    </div>
                  </li>
                  <li>Crie a tabela executando o script SQL abaixo no <strong>SQL Editor</strong> do seu console Supabase:</li>
                </ol>
              </div>

              {/* SQL instructions */}
              <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">schema-chamados.sql</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-[11px] text-zinc-800 dark:text-zinc-300 overflow-x-auto max-h-[180px] leading-relaxed">
                  {SUPABASE_SQL_INSTRUCTIONS}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
