/**
 * Name Transliteration & Linguistic Normalization Helper
 * Handles:
 * - Indic scripts: Devanagari (Hindi, Marathi), Bengali, Gurmukhi (Punjabi), Gujarati, Tamil, Telugu, Kannada, Malayalam
 * - Cyrillic script: Russian, Ukrainian, Bulgarian, Serbian
 * - Arabic common names & basic phonetic mapping
 * - European Latin diacritics & accented characters (é, ü, ö, ñ, ø, ł, ß, æ, etc.)
 * - Emoji and symbol sanitization
 */

// Devanagari vowel and consonant mappings
const DEV_VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah'
};

const DEV_MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h'
};

const DEV_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'f', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'ळ': 'l',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
  'ऩ': 'n', 'ऱ': 'r'
};

function devanagariToLatin(text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1] || '';

    if (Object.prototype.hasOwnProperty.call(DEV_VOWELS, ch)) {
      res += DEV_VOWELS[ch];
    } else if (Object.prototype.hasOwnProperty.call(DEV_CONSONANTS, ch)) {
      res += DEV_CONSONANTS[ch];
      if (next === '्') {
        // Virama/halant: suppresses vowel
        i++;
      } else if (Object.prototype.hasOwnProperty.call(DEV_MATRAS, next)) {
        res += DEV_MATRAS[next];
        i++;
      } else if (Object.prototype.hasOwnProperty.call(DEV_CONSONANTS, next)) {
        res += 'a';
      }
      // Trailing consonant has inherent schwa deleted (karan, not karana)
    } else if (Object.prototype.hasOwnProperty.call(DEV_MATRAS, ch)) {
      res += DEV_MATRAS[ch];
    }
  }
  return res;
}

// Convert other Brahmi scripts (Bengali, Gurmukhi, Gujarati, Tamil, Telugu, Kannada, Malayalam)
// to Devanagari by Unicode block offset normalization
function indicScriptToDevanagari(str: string): string {
  let res = '';
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0980 && code <= 0x0D7F) {
      // Map down to Devanagari (0x0900..0x097F)
      const devCode = 0x0900 + (code % 0x80);
      res += String.fromCharCode(devCode);
    } else {
      res += ch;
    }
  }
  return res;
}

// Cyrillic mapping
const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

// Arabic high-frequency names dictionary
const ARABIC_NAMES: Record<string, string> = {
  'محمد': 'mohammed',
  'احمد': 'ahmed',
  'أحمد': 'ahmed',
  'علي': 'ali',
  'عمر': 'omar',
  'فاطمة': 'fatima',
  'نور': 'noor',
  'يوسف': 'yousef',
  'مريم': 'maryam',
  'خالد': 'khaled',
  'سارة': 'sara',
  'حسن': 'hassan',
  'حسين': 'hussein',
  'عبدالله': 'abdullah',
  'ابراهيم': 'ibrahim',
  'زين': 'zayn'
};

// Common honorific prefixes
export const HONORIFIC_PREFIXES = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'professor', 'shri', 'sri', 'smt',
  'sir', 'lord', 'lady', 'capt', 'captain', 'col', 'colonel', 'sheikh',
  'shaikh', 'pandit', 'ustad', 'master', 'king', 'queen', 'prince',
  'princess', 'saint', 'st'
]);

/**
 * Extracts the primary given name token from user input,
 * intelligently skipping honorifics like "Dr.", "Mr.", "Shri", etc.
 */
export function extractGivenNameToken(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const words = trimmed.split(/[\s.]+/).filter(Boolean);
  if (words.length === 0) return '';

  const firstClean = words[0].toLowerCase().replace(/[^a-z]/g, '');
  if (HONORIFIC_PREFIXES.has(firstClean) && words.length > 1) {
    return words[1];
  }
  return words[0];
}

/**
 * Normalizes any cultural script, diacritic, or phonetic variation into
 * standard lowercase ASCII [a-z].
 */
export function transliterateToAscii(input: string): string {
  if (!input) return '';

  const token = extractGivenNameToken(input);
  if (!token) return '';

  // 1. Check Arabic dictionary safely
  const trimmedToken = token.trim();
  if (Object.prototype.hasOwnProperty.call(ARABIC_NAMES, trimmedToken)) {
    return ARABIC_NAMES[trimmedToken];
  }

  // 2. Check Indic scripts (0x0900 - 0x0D7F)
  const hasIndic = /[\u0900-\u0D7F]/.test(token);
  if (hasIndic) {
    const devanagari = indicScriptToDevanagari(token);
    const latin = devanagariToLatin(devanagari);
    if (latin) {
      return latin.toLowerCase().replace(/[^a-z]/g, '');
    }
  }

  // 3. Check Cyrillic (0x0400 - 0x04FF)
  const hasCyrillic = /[\u0400-\u04FF]/.test(token);
  if (hasCyrillic) {
    const cyrLatin = token.toLowerCase().split('').map(c => Object.prototype.hasOwnProperty.call(CYRILLIC_MAP, c) ? CYRILLIC_MAP[c] : c).join('');
    return cyrLatin.replace(/[^a-z]/g, '');
  }

  // 4. Latin European diacritics & accents normalization
  const decomposed = token
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks (é -> e, ü -> u, etc.)
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[œŒ]/g, 'oe')
    .replace(/[ß]/g, 'ss')
    .replace(/[łŁ]/g, 'l');

  return decomposed
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Clean display name formatting, preserving proper capitalization
 * and stripping stray emojis/symbols.
 */
export function formatDisplayGivenName(raw: string): string {
  if (!raw) return '';
  const token = extractGivenNameToken(raw);
  if (!token) return '';

  // If token is native Indic or Cyrillic, transliterate for clear Latin display or use Title Case
  const ascii = transliterateToAscii(token);
  if (ascii.length >= 2) {
    return ascii.charAt(0).toUpperCase() + ascii.slice(1).toLowerCase();
  }

  // Fallback: clean non-alphanumeric symbols
  const clean = token.replace(/[^\p{L}\p{N}-]/gu, '');
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
