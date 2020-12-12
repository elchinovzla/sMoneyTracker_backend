const express = require('express');
const dashboardController = require('../controllers/dashboard');

const router = express.Router();

router.get(
  '/summaryBalancesByOwner',
  dashboardController.getSummaryBalancesByOwner
);

router.get(
  '/monthSummaryBalancesByOwner',
  dashboardController.getMonthSummaryBalancesByOwner
);

router.get(
  '/detailed-monthly-info',
  dashboardController.getDetailedMonthlyInfo
);

module.exports = router;
