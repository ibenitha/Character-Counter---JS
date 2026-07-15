/**
 * character-counter.js
 *
 * Core analysis engine for the Character Counter app.
 *
 * This file contains the calculation logic only.
 * It does not directly update HTML.
 *
 * The UI file (index.html) calls analyzeText()
 * and receives the results to display.
 *
 * Features:
 * - Character counting
 * - Word counting
 * - Sentence counting
 * - Reading time estimation
 * - Letter frequency analysis
 */


'use strict';

/*
  Strict mode helps prevent common JavaScript mistakes.

  Example:
  Without strict mode:
  x = 10;  // creates accidental global variable

  With strict mode:
  JavaScript throws an error.
*/


/* =================================================
   CONSTANTS
================================================= */


/*
  Average reading speed.

  This value is used to calculate
  estimated reading time.

  Example:
  400 words / 200 words per minute = 2 minutes
*/
const WORDS_PER_MINUTE = 200;





/* =================================================
   HELPER FUNCTIONS
================================================= */





/*
  Counts the number of words inside a text.

  Parameter:
  text = the user input string

  Returns:
  number of words
*/
function countWords(text) {


  /*
    trim() removes spaces at the beginning
    and end of the text.

    Example:
    " hello " becomes "hello"
  */
  const trimmed = text.trim();



  /*
    If after trimming there is no text,
    return 0 because there are no words.
  */
  if (!trimmed) return 0;




  /*
    split(/\s+/)

    Splits text whenever it finds
    one or more spaces/new lines.

    Example:
    "Hello world"

    becomes:

    ["Hello", "world"]

    length gives the number of words.
  */
  return trimmed.split(/\s+/).length;

}







/*
  Counts sentences in the text.

  A sentence is considered complete when
  it ends with:
  .
  !
  ?

*/
function countSentences(text) {


  // Remove unnecessary spaces
  const trimmed = text.trim();



  // Empty text has no sentences
  if (!trimmed) return 0;




  /*
    Regular expression:

    [.!?]+

    searches for sentence-ending symbols.

    + means one or more occurrences.

    Example:
    "Hello. How are you?"

    Matches:
    .
    ?
  */
  const matches = trimmed.match(/[.!?]+/g);



  /*
    If matches exist,
    return number of sentences.

    Otherwise return 1 because
    text without punctuation is treated
    as one sentence.
  */
  return matches ? matches.length : 1;

}








/*
  Calculates estimated reading time.

  Uses average reading speed:
  200 words per minute.

  Returns a readable string.
*/
function buildReadingTimeLabel(words) {


  /*
    If there are no words,
    display less than one minute.
  */
  if (words === 0) return '<1 minute';




  /*
    Math.ceil rounds numbers upward.

    Example:

    201 words / 200 = 1.005

    Math.ceil(1.005) = 2

    because it will take slightly more
    than one minute.
  */
  const minutes = Math.ceil(
    words / WORDS_PER_MINUTE
  );



  /*
    Template literal creates dynamic text.

    Example:
    minutes = 3

    Result:
    "3 minutes"
  */
  return minutes < 1
    ? '<1 minute'
    : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

}








/*
  Calculates how frequently each letter appears.

  Only alphabet letters are counted.

  Numbers, spaces and symbols are ignored.

  Example:

  Input:
  "Apple"

  Output:
  A = 1
  P = 2
  L = 1
  E = 1
*/
function computeLetterDensity(text) {



  // If text is empty return empty array
  if (!text) return [];




  /*
    Object stores letter frequency.

    Example:

    {
      A: 3,
      B: 1
    }

  */
  const freq = {};



  // Stores total number of letters
  let total = 0;




  /*
    for...of loops through every character.

    Example:

    "Cat"

    First loop:
    C

    Second:
    a

    Third:
    t
  */
  for (const ch of text) {



    /*
      Regular expression checks if character
      is an English letter.

      a-z or A-Z only.
    */
    if (/[a-zA-Z]/.test(ch)) {



      /*
        Convert letters to uppercase.

        This makes:
        a and A treated as the same letter.
      */
      const upper = ch.toUpperCase();




      /*
        Increase letter count.

        ?? means:
        if value does not exist,
        use 0.

        Example:

        freq[A] ?? 0

        If A does not exist:
        0 + 1

      */
      freq[upper] =
        (freq[upper] ?? 0) + 1;



      // Increase total letters count
      total++;

    }

  }




  // If no letters exist, return empty result
  if (total === 0) return [];





  /*
    Object.entries converts object into array.

    Example:

    {
      A:3,
      B:2
    }

    becomes:

    [
      ["A",3],
      ["B",2]
    ]

  */
  return Object.entries(freq)



    /*
      Convert every letter into an object
      that the HTML can easily display.
    */
    .map(([letter, count]) => ({


      letter,


      count,



      /*
        Calculate percentage.

        Example:

        Letter A appears 5 times
        Total letters = 100

        Percentage = 5%

        toFixed(2)
        keeps 2 decimal places.
      */
      percentage:
        ((count / total) * 100).toFixed(2),


    }))



    /*
      Sort letters by frequency.

      Highest count appears first.

      Example:

      A:20
      B:10
      C:5
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
  Main function used by index.html.

  It receives text and returns
  all calculated information.

*/
function analyzeText(text, options = {}) {



  /*
    Destructuring.

    Gets excludeSpaces value from options.

    If it does not exist,
    default value is false.
  */
  const {
    excludeSpaces = false
  } = options;





  /*
    Counts characters.

    If excludeSpaces is true:
    remove whitespace first.

    Example:

    "hello world"

    becomes:

    "helloworld"

  */
  const totalCharacters =
    excludeSpaces
      ? text.replace(/\s/g, '').length
      : text.length;





  // Calls helper functions
  const wordCount =
    countWords(text);



  const sentenceCount =
    countSentences(text);



  const readingTime =
    buildReadingTimeLabel(wordCount);



  const density =
    computeLetterDensity(text);





  /*
    Return object containing all results.

    index.html receives this object
    and updates the UI.

  */
  return {

    totalCharacters,

    wordCount,

    sentenceCount,

    readingTime,

    density,

  };

}