import React from 'react';
import { TimeSheetData } from '../types';
import { Copy, Check, FileSpreadsheet } from 'lucide-react';
import * as XLSX_Module from 'xlsx';

// Safety check for different module export formats (ESM vs CJS)
const XLSX = (XLSX_Module as any).default || XLSX_Module;

interface ResultsTableProps {
  data: TimeSheetData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [copied, setCopied] = React.useState(false);

  if (data.length === 0) return null;

  const exportExcel = () => {
    // Prepare data for Excel
    const headers = ["Empresa", "Nome", "Qtde de faltas", "Dias das faltas", "H.E. 50%", "H.E. 100%", "Adc Noturno", "Observações"];
    
    // Map data to array of arrays
    const rows = data.map(row => [
      row.empresa,
      row.nome,
      row.qtdeFaltas,
      row.diasFaltas,
      row.he50,
      row.he100,
      row.adcNoturno,
      row.observacoes
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Set column widths
    const wscols = [
      { wch: 25 }, // Empresa
      { wch: 30 }, // Nome
      { wch: 15 }, // Qtde Faltas
      { wch: 40 }, // Dias Faltas
      { wch: 15 }, // HE 50
      { wch: 15 }, // HE 100
      { wch: 15 }, // Adc Noturno
      { wch: 40 }  // Observacoes
    ];
    worksheet['!cols'] = wscols;

    // Apply Styles
    // Loop through all cells to apply styles
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell_address]) continue;

        // Base Style
        // Explicitly type as 'any' to allow adding properties like 'bold' and 'horizontal' later
        let cellStyle: any = {
          font: { name: "Arial", sz: 11, color: { rgb: "000000" } }, // Black text
          fill: { fgColor: { rgb: "FFFFFF" } }, // White background
          alignment: { vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };

        // Header Style (First Row)
        if (R === 0) {
          cellStyle = {
            ...cellStyle,
            font: { name: "Arial", sz: 12, bold: true, color: { rgb: "FFFFFF" } }, // White text
            fill: { fgColor: { rgb: "000000" } }, // Black background
            alignment: { horizontal: "center", vertical: "center" }
          };
        }

        // Apply style to cell
        worksheet[cell_address].s = cellStyle;
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Espelho de Ponto");

    // Generate filename
    const dateStr = new Date().toISOString().slice(0,10);
    const fileName = `mendonca-galvao_export_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
  };

  const copyToClipboard = () => {
    const headers = "| Empresa | Nome | Qtde de faltas | Dias das faltas | H.E. 50% | H.E. 100% | Adc Noturno | Observações |";
    const separator = "|---|---|---|---|---|---|---|---|";
    const rows = data.map(row => 
      `| ${row.empresa} | ${row.nome} | ${row.qtdeFaltas} | ${row.diasFaltas} | ${row.he50} | ${row.he100} | ${row.adcNoturno} | ${row.observacoes} |`
    ).join("\n");
    
    const markdown = `${headers}\n${separator}\n${rows}`;
    
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <h2 className="text-xl font-semibold text-white">Relatório Gerado</h2>
        <div className="flex gap-3">
           <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar Tabela'}</span>
          </button>
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-md text-sm font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Baixar Excel</span>
          </button>
        </div>
      </div>

      {/* Standard Table (Reverted to clean version) */}
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-sm text-left text-neutral-400">
          <thead className="text-xs uppercase bg-neutral-900 text-neutral-300 font-medium">
            <tr>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Funcionário</th>
              <th className="px-6 py-4 text-center">Faltas</th>
              <th className="px-6 py-4">Dias das Faltas</th>
              <th className="px-6 py-4 text-center">H.E. 50%</th>
              <th className="px-6 py-4 text-center">H.E. 100%</th>
              <th className="px-6 py-4 text-center">Adc. Not.</th>
              <th className="px-6 py-4">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-neutral-900/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{row.empresa}</td>
                <td className="px-6 py-4 font-medium text-neutral-200">{row.nome}</td>
                <td className="px-6 py-4 text-center">
                  {row.qtdeFaltas > 0 ? (
                    <span className="text-red-400 font-bold">{row.qtdeFaltas}</span>
                  ) : "-"}
                </td>
                <td className="px-6 py-4 max-w-xs truncate" title={row.diasFaltas}>
                   {row.diasFaltas || "-"}
                </td>
                <td className="px-6 py-4 text-center text-neutral-300 font-mono">{row.he50}</td>
                <td className="px-6 py-4 text-center text-neutral-300 font-mono">{row.he100}</td>
                <td className="px-6 py-4 text-center text-neutral-300 font-mono">{row.adcNoturno}</td>
                <td className="px-6 py-4 text-neutral-500 max-w-xs truncate" title={row.observacoes}>
                  {row.observacoes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};