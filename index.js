const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const tallyFile = 'tally.json';
const tallyData = fs.existsSync(tallyFile) ? JSON.parse(fs.readFileSync(tallyFile, 'utf8')) : {};

const saveTally = () => fs.writeFileSync(tallyFile, JSON.stringify(tallyData, null, 2));

client.once('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith('/')) return;

    const userId = message.author.id;
    const content = message.content.toLowerCase();
    tallyData[userId] = tallyData[userId] || {};

    Object.keys(tallyData[userId]).forEach(word => {
        if (content.includes(word)) {
            tallyData[userId][word]++;
            saveTally();
        }
    });

    const args = message.content.split(' ');
    if (args[0] === '/track' && args[1]) {
        const word = args[1].toLowerCase();
        if (!tallyData[userId][word]) tallyData[userId][word] = 0;
        saveTally();
        return message.reply(`Tracking the word "${word}" for you.`);
    }

    if (args[0] === '/tally' && args.length === 3) {
        const userMention = args[1].replace(/[<@!>]/g, '');
        const word = args[2].toLowerCase();
        return message.reply(tallyData[userMention]?.[word] 
            ? `<@${userMention}> has said "${word}" ${tallyData[userMention][word]} times.` 
            : `<@${userMention}> has never said "${word}".`);
    }
});

client.login(process.env.TOKEN);
