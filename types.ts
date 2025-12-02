export interface TimeSheetData {
  empresa: string;
  nome: string;
  qtdeFaltas: number;
  diasFaltas: string;
  he50: string;
  he100: string;
  adcNoturno: string;
  observacoes: string;
}

export interface ProcessingStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
}