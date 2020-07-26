const express = require('express');
const savingsController = require('../controllers/savings');

const router = express.Router();

router.post(
  '/savings', savingsController.createSavings
);

router.get(
  '/savings', savingsController.getSavingsEntries
);

router.get(
  '/savings-count/:createdById', savingsController.getTotalSavingsRecords
);

router.get(
  '/savings/:id', savingsController.getSavingsById
);

router.get(
  '/savings-infoByOwner/:createdById', savingsController.getSavingsInfo
);

router.patch(
  '/update-savings/:id', savingsController.updateSavings
);

router.delete(
  '/savings/:id', savingsController.deleteSavings
);

module.exports = router;
