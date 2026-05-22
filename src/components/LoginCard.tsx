import React, { useState } from 'react';
import { LoggedInUser, UserRole } from '../types';
import { Lock, User, ShieldAlert, KeyRound, Hammer, ClipboardList, Database } from 'lucide-react';
import ConnectionBadge from './ConnectionBadge';

interface LoginCardProps {
  onLoginSuccess: (user: LoggedInUser) => void;
  isRealTime: boolean;
  dbMessage?: string;
}

export default function LoginCard({ onLoginSuccess, isRealTime, dbMessage }: LoginCardProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const userClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput;

    if (userClean === 'operador' && passClean === 'operador123') {
      onLoginSuccess({
        username: 'operador',
        role: 'operador',
        name: 'Operador de Linha (Setor A)'
      });
    } else if (userClean === 'mecanico' && passClean === 'mecanico123') {
      onLoginSuccess({
        username: 'mecanico',
        role: 'mecanico',
        name: 'Carlos - Mecânico Chefe'
      });
    } else {
      setErrorMsg('Credenciais inválidas. Verifique o usuário e a senha informados.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'operador') {
      onLoginSuccess({
        username: 'operador',
        role: 'operador',
        name: 'Operador de Linha (Setor A)'
      });
    } else {
      onLoginSuccess({
        username: 'mecanico',
        role: 'mecanico',
        name: 'Carlos - Mecânico Chefe'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="login-container" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-300">
        
        {/* Card Header Banner */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 p-8 text-white relative">
          <div className="absolute top-4 right-4">
            <ConnectionBadge isRealTime={isRealTime} dbMessage={dbMessage} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <ClipboardList className="w-8 h-8 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Painel de Chamados</h2>
              <p className="text-indigo-200 text-xs mt-1">Manutenção e Operações</p>
            </div>
          </div>
        </div>

        {/* Login Form body */}
        <div className="p-8 space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            <span>Acessar o Sistema</span>
          </h3>

          <form onSubmit={handleLoginSubmit} id="form-login" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Nome de Usuário (login)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  id="input-username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: operador ou mecanico"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  id="input-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {errorMsg && (
              <div id="login-error" className="flex items-start gap-2.5 text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-200/50 dark:border-red-950/40">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-login-submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-200 text-sm cursor-pointer"
            >
              Entrar
            </button>
          </form>

          {/* Quick Access Portal */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Acesso Rápido de Teste</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3" id="quick-access-panel">
            <button
              type="button"
              onClick={() => handleQuickLogin('operador')}
              className="flex flex-col items-center justify-center p-3.5 bg-zinc-50 hover:bg-indigo-50/50 dark:bg-zinc-950 dark:hover:bg-indigo-950/10 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900/40 rounded-2xl text-center group transition-all duration-200 cursor-pointer"
            >
              <User className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mt-2 block">Operador</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">login: operador</span>
              <span className="text-[10px] text-zinc-400">senha: operador123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('mecanico')}
              className="flex flex-col items-center justify-center p-3.5 bg-zinc-50 hover:bg-violet-50/50 dark:bg-zinc-950 dark:hover:bg-violet-950/10 border border-zinc-200 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-900/40 rounded-2xl text-center group transition-all duration-200 cursor-pointer"
            >
              <Hammer className="w-5 h-5 text-violet-500 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mt-2 block">Mecânico</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">login: mecanico</span>
              <span className="text-[10px] text-zinc-400">senha: mecanico123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
