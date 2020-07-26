const express = require('express');
const moneyController = require('../controllers/money');

const router = express.Router();

router.post(
  '/money', moneyController.createMoney
);

router.get(
  '/money', moneyController.getMoneyEntries
);

router.get(
  '/money-count/:createdById', moneyController.getTotalMoneyRecords
);

router.get(
  '/money/:id', moneyController.getMoney
);

router.get(
  '/money-infoByOwner/:id', moneyController.getMoneyInfo
);

router.patch(
  '/update-money/:id', moneyController.updateMoney
);

router.delete(
  '/money/:id', moneyController.deleteMoney
);

module.exports = router;
