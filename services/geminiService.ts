import { GoogleGenAI, Type } from "@google/genai";
import { TimeSheetData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o sistema "Mendonça Galvão – Hora Extra", especialista em ler espelhos de ponto eletrônico.
Sua missão é extrair dados de Faltas, Horas Extras e Adicional Noturno de imagens ou PDFs de espelhos de ponto.

REGRAS DE LEITURA DAS FALTAS:
1. Considere como FALTA apenas linhas onde aparece explicitamente a palavra "FALTA".
2. IGNORAR: "FOL" (folga), "FER" (feriado), Atestados, Declarações, Férias, Serviço externo.
3. Para cada falta, capture o Dia da Semana (ex: Seg, Ter) e a Data (ex: 21/10).
4. Formato do campo "diasFaltas": "DiaSemana Data; DiaSemana Data" (separados por ponto e vírgula). Se não houver faltas, deixe vazio.

REGRAS DE HORAS EXTRAS E ADICIONAL NOTURNO:
1. Extraia APENAS do bloco "RESUMO" ou rodapé de totais.
2. Campos a extrair:
   - "H.E. 050%" (Total)
   - "H.E. 100%" (Total)
   - "Adc Noturno" (Total)
3. Formato: HH:MM. Se não existir, use "00:00".

ESTRUTURA DE DADOS:
Retorne um JSON contendo uma lista de objetos, onde cada objeto representa um funcionário encontrado no documento.
Campos obrigatórios: empresa, nome, qtdeFaltas (número), diasFaltas (string), he50 (string), he100 (string), adcNoturno (string), observacoes (string).

OBSERVAÇÕES:
- Se não houver faltas, qtdeFaltas = 0 e observacoes = "Sem faltas no período." (ou outra observação pertinente).
- Se os totais não forem encontrados, note isso em observacoes.
`;

export const processTimeSheetFile = async (
  fileBase64: string,
  mimeType: string
): Promise<TimeSheetData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64,
            },
          },
          {
            text: "Analise este espelho de ponto e extraia os dados conforme as instruções.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              empresa: { type: Type.STRING },
              nome: { type: Type.STRING },
              qtdeFaltas: { type: Type.NUMBER },
              diasFaltas: { type: Type.STRING },
              he50: { type: Type.STRING },
              he100: { type: Type.STRING },
              adcNoturno: { type: Type.STRING },
              observacoes: { type: Type.STRING },
            },
            required: [
              "empresa",
              "nome",
              "qtdeFaltas",
              "diasFaltas",
              "he50",
              "he100",
              "adcNoturno",
              "observacoes",
            ],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TimeSheetData[];
    }
    return [];
  } catch (error) {
    console.error("Error processing file with Gemini:", error);
    throw new Error("Falha ao processar o documento. Verifique se é uma imagem ou PDF válido.");
  }
};
