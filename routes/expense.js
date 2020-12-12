const express = require('express');
const expenseController = require('../controllers/expense');

const router = express.Router();

router.post('/expense', expenseController.createExpense);

router.get('/expense', expenseController.getExpenses);

router.get('/expense/:id', expenseController.getExpenseById);

router.get('/expense-count', expenseController.getTotalExpenseRecordsCount);

router.get('/monthly-infoByOwnerId', expenseController.getMonthlyExpenseInfo);

router.get('/annual-infoByOwnerId', expenseController.getAnnualExpenseInfo);

router.patch('/expense', expenseController.updateExpense);

router.delete('/expense/:id', expenseController.deleteExpense);

module.exports = router;
