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

async function fetchHowTos(input) {
    try {
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

            if (stringText.includes(input)) {
                endString += stringText + '\n';
            };

        });

        if (endString === '') {
            endString = `No how-tos found for “${input}”.`;
        }

        return endString;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

module.exports = fetchHowTos;
