const axios = require('axios');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');

async function fetchArticleContent(url) {
    console.log('url: ', url);
    try {
        // Fetch the HTML from the URL
        const { data } = await axios.get(url);

        // Load the HTML into Cheerio
        const $ = cheerio.load(data);

        // Extract the content inside the <article> tag
        // const articleContent = $('article .markdown').html();
        // const articleContent = $('article .markdown').text();
        // const articleContent = $('article .markdown').text();
        let articleContent = $('article .markdown').html();
        // console.log('typeof articleContent: ', typeof articleContent);
        articleContent = htmlToText.htmlToText(articleContent);
        // Return the content
        // console.log('articleContent: ', articleContent);
        // return articleContent.innerText;
        return articleContent;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

module.exports = fetchArticleContent;
