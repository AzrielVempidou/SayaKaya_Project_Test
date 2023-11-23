const schedule = require('node-schedule');
const { Client } = require('whatsapp-web.js');
const { User, Sequelize } = require('../models'); 
const { Op } = require('sequelize');
const qrcode = require('qrcode-terminal');

class WaController {
  constructor() {
    this.client = new Client();

    this.client.on('qr', (qrCode) => {
      console.log('Silakan scan QR code ini dengan WhatsApp untuk masuk:');
      qrcode.generate(qrCode, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Bot WhatsApp siap untuk mengirimkan pesan!');
      this.scheduleDailyBirthdayMessages();
    });

    this.initializeClient();
  }

  async initializeClient() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error.message);
    }
  }

  async fetchUsersAndBirthdayToday({ email, verifiedStatus }) {
    const today = new Date();

    try {
      const users = await User.findAll({
        where: {
          email,
          verifiedStatus,
          [Op.and]: Sequelize.literal(`
            EXTRACT(MONTH FROM "birthDay") = ${today.getMonth() + 1}
            AND EXTRACT(DAY FROM "birthDay") = ${today.getDate()}
          `),
        },
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  }

  async sendBirthdayMessage(user) {
    const message = `Selamat ulang tahun, ${user.name}! 🎉🎂`;
    const chatId = `${user.whatsappNumber}@c.us`.replace(/[^\d]/g, '');

    try {
      const chat = await this.client.getChatById(chatId);
      await chat.sendMessage(message);

      const promoCode = 'BDAY2023'; 
      console.log(`Promo Code: ${promoCode}`);

      const notificationType = 'Birthday Promo';
      const subject = 'Selamat Ulang Tahun!';
      const body = `Selamat ulang tahun, ${user.name}! Dapatkan promo spesial ${promoCode} untuk diskon 10%.`;
      const target = user.email;
      console.log(`Mengirim notifikasi ${notificationType} kepada ${target}: ${subject}\n${body}`);

    } catch (error) {
      console.error('Error sending birthday message:', error.message);
    }
  }

  async sendBirthdayMessages(users) {
    try {
      await Promise.all(users.map(user => this.sendBirthdayMessage(user)));
    } catch (error) {
      console.error('Error sending birthday messages:', error.message);
    }
  }

  async getBirthdayUsersAndSendMessages({ email, verifiedStatus }) {
    try {
      const users = await this.fetchUsersAndBirthdayToday({ email, verifiedStatus });

      if (users.length > 0) {
        await this.sendBirthdayMessages(users);
      }
    } catch (error) {
      console.error('Error getting birthday users and sending messages:', error.message);
    }
  }

  scheduleDailyBirthdayMessages() {
    try {
      const rule = new schedule.RecurrenceRule();
      rule.hour = 7;
      rule.minute = 42; // Setiap harinya pada pukul 6:45 pagi

      schedule.scheduleJob(rule, async () => {
        try {
          await this.getBirthdayUsersAndSendMessages({ email: 'example@email.com', verifiedStatus: true });
          console.log('Birthday messages scheduled successfully at 6:45 AM');
        } catch (error) {
          console.error('Error during scheduled job:', error.message);
        }
      });
    } catch (error) {
      console.error('Error scheduling daily birthday messages:', error.message);
    }
  }
}

module.exports = WaController;
