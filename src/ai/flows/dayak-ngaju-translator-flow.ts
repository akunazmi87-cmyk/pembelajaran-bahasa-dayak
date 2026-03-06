'use server';
/**
 * @fileOverview A Genkit flow for translating text between Dayak Ngaju and Indonesian.
 *
 * - translateDayakNgaju - A function that handles the translation process.
 * - TranslationInput - The input type for the translateDayakNgaju function.
 * - TranslationOutput - The return type for the translateDayakNgaju function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslationInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.enum(['dayak-ngaju', 'indonesian']).describe('The target language for the translation (either "dayak-ngaju" or "indonesian").'),
});
export type TranslationInput = z.infer<typeof TranslationInputSchema>;

const TranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

/**
 * Translates text between Dayak Ngaju and Indonesian.
 * The source language is inferred based on the targetLanguage field.
 *
 * @param input - An object containing the text to translate and the target language.
 * @returns An object containing the translated text.
 */
export async function translateDayakNgaju(input: TranslationInput): Promise<TranslationOutput> {
  return dayakNgajuTranslationFlow(input);
}

const dayakNgajuTranslationPrompt = ai.definePrompt({
  name: 'dayakNgajuTranslationPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: TranslationOutputSchema },
  prompt: `You are a highly skilled linguist specializing in Dayak Ngaju and Indonesian languages.
Your task is to translate the provided text.

If the target language is "dayak-ngaju", assume the input text is Indonesian and translate it to Dayak Ngaju.
If the target language is "indonesian", assume the input text is Dayak Ngaju and translate it to Indonesian.

Only return the translated text, without any additional comments or explanations.

Text to translate: {{{text}}}
Target language: {{{targetLanguage}}}`,
});

const dayakNgajuTranslationFlow = ai.defineFlow(
  {
    name: 'dayakNgajuTranslationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async (input) => {
    const { output } = await dayakNgajuTranslationPrompt(input);
    return output!;
  }
);
