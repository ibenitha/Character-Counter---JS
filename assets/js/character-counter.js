/**
 * character-counter.js
 *
 * This file contains the text analysis logic.
 * It calculates the results but does not directly change the HTML.
 *
 * The inline JavaScript in index.html calls analyzeText()
 * and uses the returned results to update the UI.
 */

'use strict';

/*
  Strict mode helps prevent common JavaScript mistakes,
  such as accidentally creating global variables.
*/


/* =================================================
   CONSTANT
================================================= */

/*
  Average reading speed used to estimate
  how long it takes to read the text.
*/
const WORDS_PER_MINUTE = 200;


/* =================================================
   HELPER FUNCTIONS
================================================= */


/*
  Count the number of words in the text.

  Words are separated by whitespace,
  such as spaces, tabs, or new lines.
*/
function countWords(text) {

  // Remove spaces from the beginning and end.
  const trimmed = text.trim();

  // If the text is empty, there are no words.
  if (!trimmed) return 0;

  /*
    Split the text wherever there is one or more
    whitespace characters.

    Example:
    "Hello   world"

    becomes:
    ["Hello", "world"]
  */
  return trimmed.split(/\s+/).length;
}


/*
  Count sentences based on sentence-ending punctuation.

  A sentence is counted when the text contains:
  .
  !
  ?
*/
function countSentences(text) {

  // Remove spaces from the beginning and end.
  const trimmed = text.trim();

  // Empty text contains no sentences.
  if (!trimmed) return 0;

  /*
    Find one or more sentence-ending punctuation marks.

    The "g" flag searches through the entire string.
  */
  const matches = trimmed.match(/[.!?]+/g);

  /*
    If punctuation was found, return the number
    of matches.

    If no punctuation was found, treat the text
    as one sentence.
  */
  return matches ? matches.length : 1;
}


/*
  Convert a word count into a readable
  estimated reading-time label.
*/
function buildReadingTimeLabel(words) {

  // No words means less than one minute.
  if (words === 0) return '<1 minute';

  // Calculate the number of minutes and round up.
  const minutes = Math.ceil(
    words / WORDS_PER_MINUTE
  );

  /*
    Use singular "minute" for 1
    and plural "minutes" for other values.
  */
  return minutes < 1
    ? '<1 minute'
    : `${minutes} ${
        minutes === 1
          ? 'minute'
          : 'minutes'
      }`;
}


/*
  Calculate how often each letter appears.

  Only English letters are counted.
  Spaces, numbers, and punctuation are ignored.
*/
function computeLetterDensity(text) {

  // No text means no density results.
  if (!text) return [];

  /*
    This object stores each letter and its count.

    Example:
    {
      A: 3,
      B: 1
    }
  */
  const freq = {};

  // Stores the total number of letters.
  let total = 0;


  /*
    Loop through each character in the text.
  */
  for (const ch of text) {

    // Only count English alphabet letters.
    if (/[a-zA-Z]/.test(ch)) {

      /*
        Convert the character to uppercase
        so "a" and "A" are counted together.
      */
      const upper = ch.toUpperCase();

      /*
        Increase the count for this letter.

        If the letter does not exist yet,
        use 0 before adding 1.
      */
      freq[upper] =
        (freq[upper] ?? 0) + 1;

      // Increase the total number of letters.
      total++;
    }
  }


  // If there were no letters, return an empty array.
  if (total === 0) return [];


  /*
    Convert the frequency object into an array
    so it can be transformed and sorted.
  */
  return Object.entries(freq)

    /*
      Convert each [letter, count] pair
      into an object with display-ready data.
    */
    .map(([letter, count]) => ({

      letter,

      count,

      // Calculate the percentage of the total letters.
      percentage:
        ((count / total) * 100).toFixed(2),

    }))


    /*
      Sort by highest frequency first.

      If two letters have the same count,
      sort them alphabetically.
    */
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.letter.localeCompare(b.letter)
    );
}


/* =================================================
   MAIN FUNCTION
================================================= */


/*
  Main function called by index.html.

  It combines all the helper functions
  and returns the complete analysis result.
*/
function analyzeText(text, options = {}) {

  /*
    Get the excludeSpaces option.

    If no value is provided,
    excludeSpaces defaults to false.
  */
  const {
    excludeSpaces = false
  } = options;


  /*
    Count characters.

    If excludeSpaces is true,
    remove whitespace before counting.

    Otherwise, count the original text.
  */
  const totalCharacters =
    excludeSpaces
      ? text.replace(/\s/g, '').length
      : text.length;


  // Calculate the number of words.
  const wordCount =
    countWords(text);


  // Calculate the number of sentences.
  const sentenceCount =
    countSentences(text);


  // Calculate the estimated reading time.
  const readingTime =
    buildReadingTimeLabel(wordCount);


  // Calculate the letter-frequency data.
  const density =
    computeLetterDensity(text);


  /*
    Return all calculated results in one object.

    The inline JavaScript receives this object
    and uses it to update the HTML.
  */
  return {

    totalCharacters,

    wordCount,

    sentenceCount,

    readingTime,

    density,

  };
}