'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating contextual example sentences
 * in Dayak Ngaju for a given vocabulary word and its Indonesian translation.
 *
 * - vocabularyContextualizer - A function that handles the generation of example sentences.
 * - VocabularyContextualizerInput - The input type for the vocabularyContextualizer function.
 * - VocabularyContextualizerOutput - The return type for the vocabularyContextualizer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VocabularyContextualizerInputSchema = z.object({
  word: z.string().describe('The Dayak Ngaju vocabulary word.'),
  translation: z.string().describe('The Indonesian translation of the word.'),
  numExamples: z
    .number()
    .optional()
    .default(3)
    .describe('The number of example sentences/phrases to generate.'),
});
export type VocabularyContextualizerInput = z.infer<
  typeof VocabularyContextualizerInputSchema
>;

const VocabularyContextualizerOutputSchema = z.object({
  examples: z
    .array(z.string())
    .describe('An array of example sentences or phrases in Dayak Ngaju.'),
});
export type VocabularyContextualizerOutput = z.infer<
  typeof VocabularyContextualizerOutputSchema
>;

export async function vocabularyContextualizer(
  input: VocabularyContextualizerInput
): Promise<VocabularyContextualizerOutput> {
  return vocabularyContextualizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vocabularyContextualizerPrompt',
  input: { schema: VocabularyContextualizerInputSchema },
  output: { schema: VocabularyContextualizerOutputSchema },
  prompt:
    'You are a language expert and teacher specialized in Dayak Ngaju. Your task is to generate {{numExamples}} distinct example sentences or short phrases in Dayak Ngaju using the word "{{{word}}}". The Indonesian translation of this word is "{{{translation}}}".\n\nEnsure the examples demonstrate the word\'s usage in different contexts, are appropriate for middle/high school students, and are grammatically correct in Dayak Ngaju. Provide only the sentences as a JSON array.',
});

const vocabularyContextualizerFlow = ai.defineFlow(
  {
    name: 'vocabularyContextualizerFlow',
    inputSchema: VocabularyContextualizerInputSchema,
    outputSchema: VocabularyContextualizerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
