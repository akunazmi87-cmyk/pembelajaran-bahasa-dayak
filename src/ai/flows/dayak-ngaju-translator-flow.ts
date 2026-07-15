
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
  "kalian": "kento",
  "sungai": "sungei",
  "sebelah": "hila",
  "sebelah hulu": "hila ngaju",
  "lain": "beken",
  "memiliki": "tempon",
  "cerita": "sarita",
  "supaya": "uka",
  "diketahui": "ingatawan",
  "lebar": "kalombah",
  "lebarnya": "kalombahie",
  "ujung": "tapakan",
  "dari": "bara",
  "ini": "jetoh",
  "tahun": "nyelo",
  "yang lalu": "je halau",
  "tenggelam": "leteng",
  "dahulu kala": "bihin huruan",
  "sebelum": "sahindai",
  "desa": "lewu",
  "dikira": "ingara",
  "nama": "aran",
  "penghidupan": "pambelom",
  "cukup": "sukup",
  "kebutuhan": "kebutuhan",
  "berlimpah ruah": "balimpah ruah",
  "diaut": "ianut",
  "di mana": "into kueh",
  "melaksanana": "malalus",
  "ritual": "ritual",
  "selalu": "sanutara",
  "sekuat": "sakalepah",
  "lari": "handari",
  "terdesak": "tadsak",
  "hutan": "himba",
  "inilah": "tolah",
  "kembali": "halui",
  "mengatur": "maatur",
  "menggunakan": "manggunakan",
  "senjata": "sanjata",
  "tradisional": "tradisional",
  "sumpit": "sipet",
  "mandau": "mandau",
  "tombak": "tombak",
  "semangat": "samangat",
  "berhasil": "bahasil",
  "mengalahkan": "menampakalah",
  "penyerangan": "panyarangan",
  "sekali ini": "sinde toh",
  "di lengkapi": "ilengkapi",
  "ketuaan": "kabakas",
  "pengganti nya": "panggantie",
  "di ambil": "induan",
  "mati": "matie",
  "henti": "tande",
  "henti henti": "tande tande",
  "bertapa": "balampah",
  "pertama": "palampah",
  "mengamuk": "mengamuk",
  "keganasannya": "kaslake",
  "membalik": "mambalik",
  "menghempas": "mahampas",
  "mengaramka": "mangahem",
  "meneggelaml": "mampeleteng",
  "gundukan": "tuyukan",
  "keselamatan": "kasalamatan",
  "mereka": "ewen",
  "tua tua": "bakas bakas",
  "di sebut": "inyewot",
  "menjaga": "manjaga",
  "terutama": "tratuma",
  "ketika": "katika",
  "tualan": "getem",
  "kekasaran": "kakasaran",
  "merampas": "meramopas",
  "perempuan": "bawi",
  "gadis": "bujang",
  "tertarik": "tatarik",
  "baik baik": "bahalap bahalap",
  "sekitar": "sakaltar",
  "tentara": "tantara",
  "mulai": "nampara",
  "membuat": "manampa",
  "kemarahan": "kasingi",
  "merasa": "mangkeme",
  "menggempur": "manggempur",
  "akhirnya": "kajarie",
  "di timbun": "ingawuk",
  "timbul": "lembut",
  "ditumbuhi": "inumbu",
  "banyak macam": "are macam",
  "pencari": "panggau",
  "ikan": "laok",
  "pencari ikan": "panggau laok",
  // Tambahan dari gambar
  "besar sekali": "hai toto",
  "lampu": "sumbu",
  "dilihat": "inampayah",
  "bunyi": "auh",
  "suara": "auh",
  "bernama": "bagare",
  "merdu": "bahalap",
  "cantik": "bahalap",
  "sulit": "bahali",
  "sukar": "bahali",
  "bertapa": "balampah",
  "berpagar": "bapagar",
  "terkenal": "basewot",
  "hidup": "belom",
  "buah": "bua",
  "kelihatan": "gitan",
  "malam": "hamalem",
  "berpisah": "hapisah",
  "arah hulu": "hila ngaju",
  "sebelah hulu": "hila ngaju",
  "rumah": "huma",
  "atas": "hunjon",
  "tanam": "imbul",
  "digosoknya": "inggosoke",
  "kebesaran": "kahaian",
  "kejadian": "kajadian",
  "terangnya": "kalawan",
  "masing masing": "ayu ayu",
  "berguna": "baguna",
  "bahaya": "bahaya",
  "panas": "balasut",
  "dari": "bara",
  "hanya": "baya",
  "benteng": "benteng",
  "datang": "dumah",
  "sekeliling": "hakailing",
  "bersaudara": "hampari",
  "arah": "hila",
  "arah hilir": "hila ngawa",
  "sebelah hilir": "hila ngawa",
  "bambu": "humbang",
  "serumpun": "ije kaupun",
  "dikelilingi": "ingaliling",
  "jembatan": "jambatan",
  "sebesar": "kahain",
  "akhirnya": "kajariae",
  "kehabisan": "kalepahan",
  "dunia": "kalonen",
  "gelap gulita": "kaput pijem",
  "kesalahan": "kasalan",
  "abu": "kawu",
  "lima": "lime",
  "meninggal": "malihi",
  "memancarkan": "mamancarkan",
  "mengalahkan": "mampakalah",
  "membunuh": "mampatei",
  "berbuah": "mamua",
  "menebang": "maneweng",
  "supaya": "mangat",
  "mengganti": "mangganti",
  "mendekat": "manukep",
  "menyerang": "manyarang",
  "berani": "manteng",
  "hilir": "ngawa",
  "paling hilir": "paling ngawa",
  "peninggalan": "paninggalan",
  "pecah": "pusit",
  "sebangsa": "sabangsa",
  "besi": "sanaman",
  "tapi": "saran",
  "cerita": "saritan",
  "awal": "tamparan",
  "tersebar": "tasebar",
  "gelap": "kaput",
  "pagar": "karambang",
  "ketentraman": "katantraman",
  "desa": "lewo",
  "kampung": "lewo",
  "mengisi": "maisi",
  "meninggal di dunia": "malihi kalonen",
  "membeli": "mamili",
  "menerangi": "mampalawa",
  "mendirikan": "mampendeng",
  "berjalan": "mananjong",
  "melindungi": "mangalindung",
  "mengganggu": "mangganggu",
  "mencari": "manggau",
  "menurut": "manumon",
  "menyebut": "manyewot",
  "menarik": "mihir",
  "paling hulu": "paling gaju",
  "penduduknya": "panduduke",
  "gulita": "pijem",
  "ramai": "ramai",
  "tak beruku": "salembang",
  "sepanjang": "sapanjang",
  "ceritanya": "saritae",
  "terlempar": "tanjakah",
  "termasuk": "tantame",
  "semua": "uras",
  "seluruh": "uras",
  "akibatnya": "akibate",
  "anak muda": "anak tabela",
  "hari kemarin": "andau male",
  "bekasnya": "awae",
  "kuat": "nadohen",
  "erat": "nadohen",
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
