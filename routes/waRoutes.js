const express = require('express');
const WaController = require('../controllers/waController');

const router = express.Router();
const waController = new WaController(); 
router.post('/initiate-and-schedule', async (req, res) => {
  try {
    await waController.initializeClient();
    waController.scheduleDailyBirthdayMessages();
    res.status(200).send('WhatsApp bot initiated, and birthday messages scheduled successfully');
  } catch (error) {
    console.error('Error initiating or scheduling:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
