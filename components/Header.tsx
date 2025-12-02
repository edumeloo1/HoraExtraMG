import React from 'react';
import { Clock, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950 pb-6 pt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center shadow-lg shadow-amber-900/10">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
              Mendonça Galvão <span className="text-amber-500">.</span>
            </h1>
            <p className="text-sm font-medium text-amber-600 tracking-wider uppercase">
              Hora Extra & Controle de Ponto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 border border-neutral-800 rounded-full px-4 py-1.5 bg-neutral-900/50">
          <BarChart3 className="h-3 w-3" />
          <span>v1.0.0 • Sistema Inteligente</span>
        </div>
      </div>
    </header>
  );
};