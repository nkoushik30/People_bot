const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const token = '7747023173:AAFkcXfXMft7a3okjoQ7glJMSecdOflxEMQ';  // Replace with your bot token
const bot = new TelegramBot(token, { polling: true });
const serviceAccount = require("../key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text !== '/getlist' && text !== '/start') {
        await db.collection('SynonymsBot').add({
            ID: msg.from.id,
            Name: msg.from.first_name,
            text: msg.text
        });
    }

    if (text === '/start') {
        bot.sendMessage(chatId, 
            "📖 *Welcome to Synonyms Bot!* 🤖\n\n" +
            "I help you find synonyms for any word.\n\n" +
            "🟢 *How to use?*\n" +
            "• Enter a word to get its synonyms.\n" +
            "• Type `/getlist` to see your search history.\n\n" +
            "Try entering a word now!", 
            { parse_mode: 'MarkdownV2' }
        );
    } 
    else if (text === '/getlist') {
        try {
            const docs = await db.collection("SynonymsBot").where('ID', '==', msg.from.id).get();
            if (docs.empty) {
                bot.sendMessage(chatId, "📜 You haven't searched for any words yet.");
            } else {
                let message = "📌 *Your search history:*\n";
                docs.forEach((doc) => {
                    message += `• ${doc.data().text}\n`;
                });
                bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
            }
        } catch (error) {
            bot.sendMessage(chatId, "⚠ Error fetching your search history.");
            console.error(error);
        }
    } 
    else {
        // Fetch synonyms from Free Dictionary API
        request(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`, function (error, response, body) {
            try {
                const data = JSON.parse(body);
                if (!data || data.title === "No Definitions Found") {
                    bot.sendMessage(chatId, "❌ No synonyms found. Try another word.");
                } else {
                    let synonyms = [];
                    data.forEach(entry => {
                        if (entry.meanings) {
                            entry.meanings.forEach(meaning => {
                                if (meaning.synonyms && meaning.synonyms.length > 0) {
                                    synonyms = synonyms.concat(meaning.synonyms);
                                }
                            });
                        }
                    });

                    if (synonyms.length > 0) {
                        // Escape special characters for MarkdownV2
                        const escapedText = text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
                        const escapedSynonyms = synonyms.map(s => s.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')).join(", ");

                        bot.sendMessage(chatId, 
                            `📖 *Synonyms for '${escapedText}':*\n🔹 ${escapedSynonyms}`, 
                            { parse_mode: 'MarkdownV2' }
                        );
                    } else {
                        bot.sendMessage(chatId, "❌ No synonyms available for this word.");
                    }
                }
            } catch (err) {
                bot.sendMessage(chatId, "⚠ Error fetching synonyms.");
                console.error(err);
            }
        });
    }
});
