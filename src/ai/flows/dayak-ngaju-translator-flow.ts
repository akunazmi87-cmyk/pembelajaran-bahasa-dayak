
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

// Predefined School Lobby phrases
const SCHOOL_DATABASE: Record<string, string> = {
  "selamat datang di sekolah kami": "tabe, selamat dumah hong sakula itah",
  "apa yang bisa saya bantu?": "narai je tau nampa bantuan?",
  "perkenalkan nama saya": "kanjelanan, aran ku",
  "ini adalah ruang perpustakaan": "ji toh iete ruang perpustakaan",
  "terima kasih atas kunjungannya": "tarima kasih hapa kunjungan",
  "silakan mengisi buku tamu": "laku mahisi buku tamu",
  "halo": "tabe",
  "selamat pagi": "selamat hanjewu",
  "selamat siang": "selamat bentuk andau",
  "selamat sore": "selamat halem",
  "selamat malam": "selamat hamauh",
  "terima kasih": "tarima kasih",
  "sampai jumpa": "sampai jumpai",
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
