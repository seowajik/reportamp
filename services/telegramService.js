const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.groupId = process.env.TELEGRAM_GROUP_ID;
  }

  async sendReport(message) {
    try {
      return await this.bot.sendMessage(this.groupId, message, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Error sending telegram message:", error);
      throw error;
    }
  }
}

module.exports = new TelegramService();
