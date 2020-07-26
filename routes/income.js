const express = require('express');
const incomeController = require('../controllers/income');

const router = express.Router();

router.post('/income', incomeController.createIncome);

router.get('/income/:id', incomeController.getIncomeById);

router.get('/income', incomeController.getIncomes)

router.get('/income-count', incomeController.getTotalCountIncome);

router.get('/monthly-total', incomeController.getMonthlyIncomeByOwner);

router.get('/annual-total', incomeController.getAnnualIncomeByOwner);

router.patch('/income/:id', incomeController.updateIncome);

router.delete('/income/:id', incomeController.deleteIncome);

module.exports = router;
