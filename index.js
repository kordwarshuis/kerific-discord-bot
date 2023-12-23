const fs = require('fs');
const fetchArticleContent = require('./modules/fetchArticle.js');
const fetchHowTos = require('./modules/fetchHowTos.js');

// Synchronously read the content
const quickLinks = fs.readFileSync('./quickLinks.txt', 'utf8');
const help = fs.readFileSync('./help.txt', 'utf8');

const { Client, IntentsBitField } = require('discord.js');
require('dotenv').config();
const htmlToText = require('html-to-text');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

client.login(process.env.TOKEN); // Replace with your bot's token

function findLinkTextAfterSee(str) {
    const pattern = /See\s?:? ?<.*?<a.*?>(.*?)<\/a>/is;
    const match = pattern.exec(str);
    console.log('match: ', match);
    return match ? match[1] : null;
}
// // Example usage:
// const exampleString = 'Random text See <a href="link.html">Link Text</a> more text';
// console.log(findLinkTextAfterSee(exampleString)); // Outputs: "Link Text"

client.on('ready', (c) => {
    console.log(`👍 ${c.user.tag} is online!`);
});

client.on('messageCreate', (message) => {
    if (message.content.toLocaleLowerCase().startsWith('kerisse define')) {
        message.reply('Ok, one moment please…');

        const input = message.content.slice(15); // Adjust depending on your command length

        // Fetch the glossary JSON data
        const glossaryJsonUrl = process.env.GLOSSARY_JSON_URL;

        const removeUrls = (text) => {
            // Regex pattern to match URLs
            const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
            // Replace URLs with an empty string
            return text.replace(urlPattern, '');
        };

        // Fetch and process glossary data
        fetch(glossaryJsonUrl)
            .then(response => response.json())
            .then(glossaryData => {
                let reply = "";
                glossaryData.forEach(element => {
                    if (element.term === input) {
                        reply = `These are the ${element.definitions.length} definitions found for “${input}”:\n`;
                        element.definitions.forEach(definition => {
                            if (findLinkTextAfterSee(definition.definition) !== null) {
                                glossaryData.forEach(element => {
                                    if (element.term === findLinkTextAfterSee(definition.definition)) {
                                        console.log('findLinkTextAfterSee(definition.definition: ', findLinkTextAfterSee(definition.definition));
                                        element.definitions.forEach(el => {
                                            if (el.organisation === definition.organisation) {
                                                reply += '# ' + el.organisation + " definition:\n";
                                                reply += "\nRedirected\n";

                                                const removedUrls = removeUrls(el.definition);
                                                reply += htmlToText.htmlToText(removedUrls) + "\n";
                                            }
                                        });
                                    };
                                });
                            } else {
                                reply += '# ' + definition.organisation + " definition:\n";
                                const removedUrls = removeUrls(definition.definition);

                                reply += htmlToText.htmlToText(removedUrls) + "\n";
                            }
                        });
                        reply += "\n------------\n";
                        reply += "That's all we could find.";
                    }
                });

                if (reply.length > 1950) {
                    reply = reply.slice(0, 1950);
                    reply += "\n\n… answer truncated because it is too long.";
                    message.reply(reply);
                } else if (reply === "") {
                    message.reply(`No definitions found for “${input}”.`);
                } else {
                    message.reply(reply);
                }
            })
    }

    if (message.content.toLocaleLowerCase().startsWith('kerisse help') ||
        message.content.toLocaleLowerCase().startsWith('kerisse ?')) {
        message.reply(help);

    }

    if (message.content.toLocaleLowerCase().startsWith('kerisse whitepaper keri')) {
        message.reply('[https://github.com/SmithSamuelM/Papers/blob/master/whitepapers/KERI_WP_2.x.web.pdf]');
    }

    if (message.content.toLocaleLowerCase().startsWith('kerisse show quicklinks')) {
        message.reply(quickLinks);
    }

    if (message.content.toLocaleLowerCase().startsWith('kerisse show url')) {
        const input = message.content.slice(17); // Adjust depending on your command length

        let articleContent;

        (async () => {
            const url = input;
            articleContent = await fetchArticleContent(url);
            // console.log('articleContent: ', articleContent);
            message.reply(articleContent.slice(0, 1950));
        })();

    }

    if (message.content.toLocaleLowerCase().startsWith('kerisse how to')) {
        message.reply('Ok, searching…');
        const input = message.content.slice(15); // Adjust depending on your command length


        let articleContent;

        (async () => {
            articleContent = await fetchHowTos(input);
            // console.log('articleContent: ', articleContent);
            message.reply(articleContent.slice(0, 1950));
        })();
    }
});


