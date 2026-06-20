
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
  "selamat datang di sekolah kami": "tabe, selamat dumah hong sakula itah",
  "apa yang bisa saya bantu?": "narai je tau nampa bantuan?",
  "terima kasih": "tarima kasih",
  "halo": "tabe",
  "selamat pagi": "selamat hanjewu",
};

export async function translateDayakNgaju(input: TranslationInput): Promise<TranslationOutput> {
  return dayakNgajuTranslationFlow(input);
}

const dayakNgajuTranslationPrompt = ai.definePrompt({
  name: 'dayakNgajuTranslationPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: z.object({ translatedText: z.string() }) },
  prompt: `You are a linguist specializing in Dayak Ngaju and Indonesian.
Translate the following Indonesian text to Dayak Ngaju.
If the input is already Dayak Ngaju and the target is Indonesian, translate accordingly.

Only return the translation result.

Text: {{{text}}}
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
    
    // Check local database first
    if (SCHOOL_DATABASE[normalizedInput]) {
      return {
        translatedText: SCHOOL_DATABASE[normalizedInput],
        source: 'database'
      };
    }

    // Fallback to AI
    const { output } = await dayakNgajuTranslationPrompt(input);
    return {
      translatedText: output!.translatedText,
      source: 'ai'
    };
  }
);
