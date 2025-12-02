import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { processTimeSheetFile } from './services/geminiService';
import { TimeSheetData, ProcessingStatus } from './types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [results, setResults] = useState<TimeSheetData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusLog, setStatusLog] = useState<ProcessingStatus[]>([]);

  const handleFilesSelected = async (files: FileList) => {
    setIsProcessing(true);
    setStatusLog([]);
    const newResults: TimeSheetData[] = [];

    // Helper to read file as base64
    const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove Data URL prefix to get just base64
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setStatusLog(prev => [...prev, { fileName: file.name, status: 'processing', message: 'Lendo arquivo...' }]);

        try {
          const base64 = await readFileAsBase64(file);
          const processedData = await processTimeSheetFile(base64, file.type);
          
          if (processedData && processedData.length > 0) {
            newResults.push(...processedData);
            setStatusLog(prev => prev.map(s => 
              s.fileName === file.name 
                ? { ...s, status: 'success', message: `${processedData.length} funcionário(s) identificado(s).` } 
                : s
            ));
          } else {
             setStatusLog(prev => prev.map(s => 
              s.fileName === file.name 
                ? { ...s, status: 'error', message: 'Nenhum dado encontrado ou formato inválido.' } 
                : s
            ));
          }
        } catch (err) {
          setStatusLog(prev => prev.map(s => 
              s.fileName === file.name 
                ? { ...s, status: 'error', message: 'Erro ao processar arquivo com IA.' } 
                : s
            ));
          console.error(err);
        }
      }
      setResults(prev => [...prev, ...newResults]);
    } catch (error) {
      console.error("Global processing error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Section */}
        <section className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-light text-neutral-100">
            Processamento Inteligente de <span className="font-semibold text-amber-500">Ponto Eletrônico</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Faça upload dos espelhos de ponto (PDF ou Imagem) das empresas Jappa, Sushi Express, Jhou e Masa. 
            O sistema identifica automaticamente faltas, horas extras e adicional noturno.
          </p>
        </section>

        {/* Upload Section */}
        <section className="max-w-2xl mx-auto bg-neutral-900/20 p-1 rounded-2xl border border-neutral-800 shadow-2xl">
          <div className="bg-neutral-950 p-6 rounded-xl">
             <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
          </div>
        </section>

        {/* Status Log */}
        {statusLog.length > 0 && (
          <section className="max-w-2xl mx-auto">
             <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 space-y-2 max-h-40 overflow-y-auto">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Log de Processamento</h3>
                {statusLog.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-300 truncate max-w-[200px]">{log.fileName}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-neutral-500 text-xs hidden sm:inline">{log.message}</span>
                       {log.status === 'processing' && <span className="text-amber-500 text-xs animate-pulse">Processando...</span>}
                       {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                       {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Results Section */}
        <section>
          <ResultsTable data={results} />
        </section>

      </main>

      <footer className="border-t border-neutral-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-neutral-600">
          <p>&copy; {new Date().getFullYear()} Mendonça Galvão Consultoria. Todos os direitos reservados.</p>
          <p className="mt-2">Sistema exclusivo para uso interno.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;