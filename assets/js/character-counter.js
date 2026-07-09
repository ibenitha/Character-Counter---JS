/**
 * character-counter.js
 *
 * Core analysis engine for the Character Counter app.
 * Exports a single `analyzeText(text, options)` function consumed
 * by the inline script in index.html.
 *
 * Features
 * ────────
 * • Real-time character count (optionally excluding spaces)
 * • Word count
 * • Sentence count
 * • Line count
 * • Estimated reading time (avg 200 wpm)
 * • Letter-density map (letters only, sorted by frequency desc)
 */

'use strict';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

/** Average adult reading speed in words per minute. */
const WORDS_PER_MINUTE = 200;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

/**
 * Count words in a string.
 * Splits on any run of whitespace; empty strings produce 0.
 *
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Count sentences in a string.
 * A sentence ends with '.', '!', or '?' (optionally followed by
 * quotes / closing brackets before the boundary).
 *
 * @param {string} text
 * @returns {number}
 */
function countSentences(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match sentence-ending punctuation
  const matches = trimmed.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

/**
 * Count non-empty lines in a string.
 * An empty textarea value returns 0.
 *
 * @param {string} text
 * @returns {number}
 */
function countLines(text) {
  if (!text) return 0;
  return text.split('\n').filter((line) => line.trim().length > 0).length;
}

/**
 * Build a reading-time label from a word count.
 *
 * @param {number} words
 * @returns {string}  e.g. "<1 minute" | "1 minute" | "3 minutes"
 */
function buildReadingTimeLabel(words) {
  if (words === 0) return '<1 minute';
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return minutes < 1
    ? '<1 minute'
    : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

/**
 * Compute letter-density data sorted by frequency (descending).
 * Only a–z / A–Z characters are counted; digits, spaces, and
 * punctuation are ignored.
 *
 * @param {string} text
 * @returns {Array<{letter: string, count: number, percentage: string}>}
 */
function computeLetterDensity(text) {
  if (!text) return [];

  /** @type {Record<string, number>} */
  const freq = {};
  let total = 0;

  for (const ch of text) {
    if (/[a-zA-Z]/.test(ch)) {
      const upper = ch.toUpperCase();
      freq[upper] = (freq[upper] ?? 0) + 1;
      total++;
    }
  }

  if (total === 0) return [];

  return Object.entries(freq)
    .map(([letter, count]) => ({
      letter,
      count,
      // Round to 2 decimal places; keep as string for display
      percentage: ((count / total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
}

/* ─────────────────────────────────────────────
   Public API
───────────────────────────────────────────── */

/**
 * Analyse a text string and return all metrics needed by the UI.
 *
 * @param {string} text  Raw textarea value.
 * @param {{ excludeSpaces?: boolean }} [options]
 * @returns {{
 *   totalCharacters: number,
 *   wordCount: number,
 *   sentenceCount: number,
 *   lineCount: number,
 *   readingTime: string,
 *   density: Array<{letter: string, count: number, percentage: string}>
 * }}
 */
function analyzeText(text, options = {}) {
  const { excludeSpaces = false } = options;

  // Character count — respect the "exclude spaces" toggle
  const totalCharacters = excludeSpaces
    ? text.replace(/\s/g, '').length
    : text.length;

  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const lineCount = countLines(text);
  const readingTime = buildReadingTimeLabel(wordCount);
  const density = computeLetterDensity(text);

  return {
    totalCharacters,
    wordCount,
    sentenceCount,
    lineCount,
    readingTime,
    density,
  };
}
