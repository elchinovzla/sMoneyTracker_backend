const express = require('express');
const yearlyBalanceController = require('../controllers/yearly-balance');

const router = express.Router();

router.post('/yearly-balance', yearlyBalanceController.createYearlyBalance);

router.get('/yearly-balance', yearlyBalanceController.getYearlyBalanceEntries);

router.get(
  '/yearly-balance-count/:createdById',
  yearlyBalanceController.getTotalYearlyBalanceRecords
);

router.get('/yearly-balance/:id', yearlyBalanceController.getYearlyBalanceById);

router.patch(
  '/update-yearly-balance/:id',
  yearlyBalanceController.updateYearlyBalance
);

router.delete(
  '/yearly-balance/:id',
  yearlyBalanceController.deleteYearlyBalance
);

module.exports = router;
