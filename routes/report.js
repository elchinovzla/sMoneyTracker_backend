const express = require('express');
const reportController = require('../controllers/report');

const router = express.Router();

router.get('/only-expense', reportController.getOnlyExpenses);

router.get('/only-income', reportController.getOnlyIncomes);

router.get('/summary', reportController.getSummary);

module.exports = router;
