
import { GoogleGenAI, Type } from "@google/genai";

// Función para obtener el cliente de forma segura
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key no detectada. Las funciones de IA estarán limitadas.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceShiftSummary = async (notes: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return notes;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Por favor, mejora y profesionaliza el siguiente resumen de jornada laboral para un informe de empresa. Hazlo conciso y formal en español: "${notes}"`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });
    return response.text || notes;
  } catch (error) {
    console.error("Error enhancing summary with Gemini:", error);
    return notes;
  }
};

export const getWeeklyInsights = async (shiftsData: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Conecta tu API Key para ver análisis inteligentes.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza los siguientes datos de turnos de un empleado y proporciona 2-3 puntos clave sobre su puntualidad o carga de trabajo. Sé breve y motivador: ${shiftsData}`,
      config: {
        maxOutputTokens: 300,
        temperature: 0.5,
      },
    });
    return response.text || "No hay suficientes datos para el análisis.";
  } catch (error) {
    console.error("Error getting insights with Gemini:", error);
    return "Error al generar insights.";
  }
};
