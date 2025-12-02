import React, { useCallback } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }, [isProcessing, onFilesSelected]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isProcessing && e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <label 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        htmlFor="file-upload"
        className={`
          relative flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          ${isProcessing 
            ? 'border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed' 
            : 'border-neutral-700 bg-neutral-900/30 hover:bg-neutral-900 hover:border-amber-500/50 group'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-sm text-neutral-400">Processando documentos...</p>
            </div>
          ) : (
            <>
              <div className="mb-3 p-3 rounded-full bg-neutral-800 group-hover:bg-neutral-800/80 transition-colors border border-neutral-700 group-hover:border-amber-500/30">
                <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="mb-2 text-lg font-medium text-neutral-300">
                Arraste os espelhos de ponto aqui
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                Suporta PDF, JPG, PNG
              </p>
              <span className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-bold rounded-md transition-colors">
                Selecionar Arquivos
              </span>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          multiple 
          accept="image/*,application/pdf"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </label>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500">
         <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-600" />
            <span>Leitura automática de faltas e justificativas</span>
         </div>
         <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-neutral-600" />
            <span>Extração de Totais (HE 50%, 100%, Noturno)</span>
         </div>
      </div>
    </div>
  );
};