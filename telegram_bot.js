const TelegramBot = require('node-telegram-bot-api');
const Token = "7560427604:AAH8SKym3S7-5NqP_KIdNUOdMqpflKQXbys";  
const bot = new TelegramBot(Token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    let num = parseInt(msg.text);

    if (num === 7) {
        bot.sendMessage(chatId, `${num} - Thala for a reason 🦁`);
    }if (num === 45) {
        bot.sendMessage(chatId, `${num} - RO Rooo rohith`);
    }if (num === 18) {
        bot.sendMessage(chatId, `${num} - King of cricket`);
    }if (num === 10) {
        bot.sendMessage(chatId, `${num} - God of cricket`);
    }if (num === 77) {
        bot.sendMessage(chatId, `${num} - Prince cricketer`);
    }if (num === 93) {
        bot.sendMessage(chatId, `${num} - Boom Boom Bumrah`);
    }else{
        bot.sendMessage(chatId, "Ok byeeee");
    }
});
