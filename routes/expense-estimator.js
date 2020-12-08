const express = require('express');
const expenseEstimatorController = require('../controllers/expense-estimator');

const router = express.Router();

router.post(
  '/expense-estimator',
  expenseEstimatorController.createEstimatedExpense
);

router.get(
  '/expense-estimator/:id',
  expenseEstimatorController.getEstimatedExpense
);

router.patch(
  '/update-expense-estimator/:id',
  expenseEstimatorController.updateEstimatedExpense
);

router.delete(
  '/expense-estimator/:id',
  expenseEstimatorController.deleteEstimatedExpense
);

router.post('/salary', expenseEstimatorController.createSalary);

router.get('/salary/:id', expenseEstimatorController.getSalary);

router.patch('/salary/:id', expenseEstimatorController.updateSalary);

router.get(
  '/expense-estimator-detailedByOwner/:createdById',
  expenseEstimatorController.getDetailedMonthlyExpensesByOwner
);

router.get(
  '/expense-estimator-count',
  expenseEstimatorController.getTotalExpenseEstimatorRecordsCount
);

router.get(
  '/expense-estimator',
  expenseEstimatorController.getEstimatedExpenses
);

module.exports = router;
