const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: false,
    });
    this.chatId = process.env.TELEGRAM_GROUP_ID;
  }

  async sendMessage(message) {
    try {
      console.log("Sending telegram message:", message);
      const sent = await this.bot.sendMessage(this.chatId, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
      console.log("Telegram message sent:", sent);
      return sent;
    } catch (error) {
      console.error("Telegram send error:", error);
      throw error;
    }
  }
}

module.exports = new TelegramService();
