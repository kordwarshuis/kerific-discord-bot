const axios = require('axios');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');

const howToUrl = 'https://weboftrust.github.io/WOT-terms/docs/test/howtos';

function filterLinesBySubstring(str, substring) {
    // Split the string into an array of lines
    const lines = str.split('\n');

    // Filter lines that contain the substring
    const filteredLines = lines.filter(line => line.includes(substring));

    // Return the filtered lines
    return filteredLines;
}


function findSubstrings(str, substrings) {
    // Create a regex pattern
    const pattern = `(?:\\b)(${substrings.join('|')})(?:\\b)`;
    const regex = new RegExp(pattern, 'g');

    // Find matches
    const matches = str.match(regex);

    // Convert matches to a set to remove duplicates, then back to an array
    return matches ? Array.from(new Set(matches)) : [];
}

// \\b is a word boundary in regex.It matches the position where a word character is not followed or preceded by another word character, such as spaces, punctuation, the start or end of a string, etc.
// This pattern will match 'agent' and 'KEL' even if they are at the start or end of the string or followed by a punctuation mark.

// // Example usage
// const substrings = ['apple', 'banana', 'orange'];
// const text = "I have an apple and a banana and an orange in my basket.";

// const foundSubstrings = findSubstrings(text, substrings);
// console.log(foundSubstrings);  // Output: ['apple', 'banana', 'orange']


function splitStringByNonConsecutiveSpace(str) {
    return str.split(/\s+/);
}

// // Example with multiple spaces
// const textWithExtraSpaces = "This  is a sample  string    with several words.";
// const substrings = splitStringByNonConsecutiveSpace(textWithExtraSpaces);

// console.log(substrings);
// // Output will still be: ["This", "is", "a", "sample", "string", "with", "several", "words."]


async function fetchHowTos(input) {
    try {

        const arrayInput = splitStringByNonConsecutiveSpace(input.toLocaleLowerCase());
        // Fetch the HTML from the URL
        const { data } = await axios.get(howToUrl);

        // Load the HTML into Cheerio
        const $ = cheerio.load(data);

        let endString = '';

        let articleContent = $('article .markdown li');

        articleContent.each(function (index, element) {
            // 'this' or 'element' refers to the current <li> element
            // You can use Cheerio methods on 'this' or $(element)

            const stringText = htmlToText.htmlToText($(element).text());

            // if (stringText.includes(input)) {
            //     endString += stringText + '\n';
            // };

            // if (findSubstrings(stringText, arrayInput).length > 0) {
            // console.log('arrayInput: ', arrayInput);
            // console.log('findSubstrings(stringText.toLocaleLowerCase(), arrayInput): ', findSubstrings(stringText.toLocaleLowerCase(), arrayInput));
            if (findSubstrings(stringText.toLocaleLowerCase(), arrayInput).length >= arrayInput.length) {
                endString += '→ ' + stringText + '\n\n';
            };

        });

        if (endString === '') {
            endString = `No how-tos found for “${input}”.`;
            return endString;
        } else {
            endString = 'This is what I found:\n\n' + endString;
            return endString;
        }
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

module.exports = fetchHowTos;
