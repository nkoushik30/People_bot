const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const token = '7747023173:AAFkcXfXMft7a3okjoQ7glJMSecdOflxEMQ';
const bot = new TelegramBot(token, { polling: true });

var serviceAccount = require("./key.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const wordsApiKey = '05fc39fc3fmshf2fae57e3bef67dp1024b8jsn72d723f353f7';

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    console.log(msg);

    if (text !== '/getlist' && text !== '/start') {
        await db.collection('WordsBot').add({
            ID: msg.from.id,
            Name: msg.from.first_name,
            Word: msg.text
        });
    }
    if (text === '/start') {
        bot.sendMessage(
            chatId,
            "*Welcome to Word Bot!* 📖\n\n" +
            "I can fetch synonyms for any word you enter.\n\n" +
            "✅ *How to use?*\n" +
            "• Type a word to get its synonyms.\n" +
            "• Type `/getlist` to see your search history.\n\n" +
            "Try searching for synonyms now! 📝",
            { parse_mode: 'Markdown' }
        );
    } 
    else if (text === '/getlist') {
        try {
            const docs = await db.collection("WordsBot").where('ID', '==', msg.from.id).get();
            if (docs.empty) {
                bot.sendMessage(chatId, "📜 *You haven't searched for any words yet.*");
            } else {
                let message = " *Your search history:*\n";
                docs.forEach((doc) => {
                    message += `• ${doc.data().Word}\n`;
                });
                bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            }
        } catch (error) {
            bot.sendMessage(chatId, "⚠ *Error fetching your search history.*");
            console.error(error);
        }
    } 
    else {

        const wordsApiUrl = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(text)}`;
        request(
            {
                url: wordsApiUrl,
                headers: {
                    'x-rapidapi-key': wordsApiKey,
                    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
                }
            }, 
            function (error, response, body) {
                if (error) {
                    bot.sendMessage(chatId, "⚠ *Error fetching synonyms.*");
                    console.error(error);
                    return;
                }
        
                try {
                    const data = JSON.parse(body);
                    console.log("✅ Parsed Data:", data);  // Debug parsed data
        
                    if (!Array.isArray(data) || data.length === 0) {
                        bot.sendMessage(chatId, "❌ *No synonyms found. Try another word.*");
                    } else {
                        // Extract only words from the response
                        let synonymList = data.map(item => item.word).slice(0, 10).join(", ");
        
                        bot.sendMessage(
                            chatId,
                            `📖 *Synonyms for '${text}':*\n🔹 ${synonymList}`,
                            { parse_mode: 'Markdown' }
                        );
                    }
                } catch (err) {
                    bot.sendMessage(chatId, "⚠ *Error processing word data.*");
                    console.error(err);
                }
            }
        );
    }
});
