
'use server';
/**
 * @fileOverview A Genkit flow for translating text between Dayak Ngaju and Indonesian.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslationInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.enum(['dayak-ngaju', 'indonesian']).default('dayak-ngaju'),
});
export type TranslationInput = z.infer<typeof TranslationInputSchema>;

const TranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
  source: z.enum(['database', 'ai']).describe('The source of the translation.'),
});
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

// School and Vocabulary Database
const SCHOOL_DATABASE: Record<string, string> = {
  "ular": "handipe",
  "monyet": "bakei",
  "rumah": "rumah",
  "pintu": "batunggang",
  "jendela": "basenguk",
  "gigi": "kasinga",
  "bibir": "biwih",
  "telinga": "pinding",
  "tangan": "lenge",
  "kaki": "pai",
  "pusar": "puser",
  "hidung": "urung",
  "leher": "uyat",
  "mata": "mate",
  "bawah": "penda",
  "atas": "hunjut",
  "pantat": "para",
  "kanan": "gantau",
  "kiri": "sambil",
  "belajar": "balajar",
  "tuhan": "hatalla",
  "selamat makan": "salamat kuman",
  "makan": "kuman",
  "hati-hati": "buah buah",
  "hidup": "pambelum",
  "rajin": "rajin",
  "mandi": "mandui",
  "tidur": "batiruh",
  "bangun": "misik",
  "minum": "mihup",
  "menyisir": "manyarak",
};

// Reverse Database for Dayak Ngaju to Indonesian lookup
const REVERSE_SCHOOL_DATABASE: Record<string, string> = Object.entries(SCHOOL_DATABASE).reduce((acc, [key, value]) => {
  acc[value.toLowerCase()] = key;
  return acc;
}, {} as Record<string, string>);

export async function translateDayakNgaju(input: TranslationInput): Promise<TranslationOutput> {
  return dayakNgajuTranslationFlow(input);
}

const dayakNgajuTranslationPrompt = ai.definePrompt({
  name: 'dayakNgajuTranslationPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: z.object({ translatedText: z.string() }) },
  prompt: `You are a linguist specializing in Dayak Ngaju and Indonesian.
If targetLanguage is 'dayak-ngaju', translate the Indonesian text to Dayak Ngaju.
If targetLanguage is 'indonesian', translate the Dayak Ngaju text to Indonesian.

Only return the translated text result without any explanations.

Text to translate: {{{text}}}
Target Language: {{{targetLanguage}}}`,
});

const dayakNgajuTranslationFlow = ai.defineFlow(
  {
    name: 'dayakNgajuTranslationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async (input) => {
    const normalizedInput = input.text.toLowerCase().trim();
    const target = input.targetLanguage;

    // 1. Check Database first
    if (target === 'dayak-ngaju') {
      if (SCHOOL_DATABASE[normalizedInput]) {
        return {
          translatedText: SCHOOL_DATABASE[normalizedInput],
          source: 'database'
        };
      }
    } else {
      if (REVERSE_SCHOOL_DATABASE[normalizedInput]) {
        return {
          translatedText: REVERSE_SCHOOL_DATABASE[normalizedInput],
          source: 'database'
        };
      }
    }

    // 2. Fallback to AI if not found in local database
    const { output } = await dayakNgajuTranslationPrompt(input);
    return {
      translatedText: output!.translatedText,
      source: 'ai'
    };
  }
);
