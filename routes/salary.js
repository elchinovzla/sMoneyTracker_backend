const express = require('express');
const salaryController = require('../controllers/salary');

const router = express.Router();

router.post('/salary', salaryController.createSalary);

router.get('/salary', salaryController.getSalaryEntries);

router.get(
  '/salary-count/:createdById',
  salaryController.getTotalSalaryRecords
);

router.get('/salary/:id', salaryController.getSalaryById);

router.get(
  '/monthly-salary/:createdById',
  salaryController.getMonthlySalaryAmount
);

router.patch('/update-salary', salaryController.updateSalary);

router.delete('/salary/:id', salaryController.deleteSalary);

module.exports = router;
