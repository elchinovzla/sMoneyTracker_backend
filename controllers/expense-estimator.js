const EstimatedExpense = require('../models/estimated-expense');
const SalaryController = require('../controllers/salary');
const common = require('./common');
const Dinero = common.Dinero;
const expenseType = require('./types/expense');
const EXPENSE_TYPE = expenseType.EXPENSE_TYPE;

exports.createEstimatedExpense = (req, res, next) => {
  const expense = new EstimatedExpense({
    description: req.body.description,
    expenseType: req.body.expenseType,
    amount: req.body.amount,
    createdById: req.body.createdById,
  });
  expense
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Estimated expense created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating estimated expense: ' + error,
      });
    });
};

exports.getEstimatedExpense = (req, res, next) => {
  EstimatedExpense.findById(req.params.id)
    .then((estimatedExpense) => {
      if (estimatedExpense) {
        res.status(200).json(estimatedExpense);
      } else {
        res.status(400).json({ message: 'Estimated expense not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get estimated expense: ' + error,
      });
    });
};

exports.updateEstimatedExpense = (req, res, next) => {
  EstimatedExpense.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      expenseType: req.body.expenseType,
      amount: req.body.amount,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Estimated expense updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update estimated expense: ' + error,
      });
    });
};

exports.deleteEstimatedExpense = (req, res, next) => {
  EstimatedExpense.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Estimated expense deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete estimated expense: ' + error,
      });
    });
};

exports.getDetailedMonthlyExpensesByOwner = (req, res, next) => {
  let expenseInfo = {};
  Promise.all([
    SalaryController.getMonthlySalary(req.params.createdById),
    EstimatedExpense.find({ createdById: req.params.createdById }),
  ])
    .then((results) => {
      if (results[0]) {
        expenseInfo.monthlySalaryAmount = results[0];
      } else {
        expenseInfo.monthlySalaryAmount = 0;
      }
      if (results[1]) {
        let estimatedExpenses = results[1];
        expenseInfo.monthlyTotalExpectedExpenseAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          null
        );
        expenseInfo.budgetDineOutAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.DINE_OUT
        );
        expenseInfo.budgetGiftAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.GIFT
        );
        expenseInfo.budgetGroceryAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.GROCERY
        );
        expenseInfo.budgetHouseAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.HOUSE
        );
        expenseInfo.budgetMembershipAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.MEMBERSHIP
        );
        expenseInfo.budgetOtherAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.OTHER
        );
        expenseInfo.budgetTransportationAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.TRANSPORTATION
        );
        expenseInfo.budgetTravelAmount = getTotalEstimatedExpenses(
          estimatedExpenses,
          EXPENSE_TYPE.TRAVEL
        );
      } else {
        expenseInfo.monthlyTotalExpectedExpenseAmount = 0;
        expenseInfo.budgetDineOutAmount = 0;
        expenseInfo.budgetGiftAmount = 0;
        expenseInfo.budgetGroceryAmount = 0;
        expenseInfo.budgetHouseAmount = 0;
        expenseInfo.budgetMembershipAmount = 0;
        expenseInfo.budgetOtherAmount = 0;
        expenseInfo.budgetTransportationAmount = 0;
        expenseInfo.budgetTravelAmount = 0;
      }
      expenseInfo.monthlyTotalEstimatedSpareAmount = getTotalEstimatedSpare(
        expenseInfo.monthlyTotalExpectedExpenseAmount,
        expenseInfo.monthlySalaryAmount
      );

      res.status(200).json(expenseInfo);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get budget info: ' + error,
      });
    });
};

exports.getTotalExpenseEstimatorRecordsCount = (req, res, next) => {
  const expenseEstimatorType = req.query.expenseType;
  const expenseEstimatorQuery = EstimatedExpense.find({
    createdById: req.query.createdById,
  });
  if (expenseEstimatorType) {
    expenseEstimatorQuery.where('expenseType', expenseEstimatorType);
  }
  expenseEstimatorQuery
    .then((expenseEstimators) => {
      if (expenseEstimators) {
        res.status(200).json({
          totalCount: common.getTotal(expenseEstimators),
        });
      } else {
        res.status(200).json({
          totalCount: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get total expense estimators: ' + error,
      });
    });
};

exports.getEstimatedExpenses = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const expenseType = req.query.expenseType;
  const estimatedExpenseQuery = EstimatedExpense.find({
    createdById: req.query.createdById,
  }).sort([['description', 1]]);
  if (pageSize && currentPage) {
    estimatedExpenseQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  if (expenseType) {
    estimatedExpenseQuery.where('expenseType', expenseType);
  }

  estimatedExpenseQuery
    .then((estimatedExpense) => {
      res.status(200).json({
        message: 'Estimated Expenses fetched successfully',
        estimatedExpense: estimatedExpense,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get estimated expenses: ' + error,
      });
    });
};

function getTotalEstimatedExpenses(estimatedExpenses, expenseType) {
  let totalAmount = Dinero({ amount: 0 });
  if (expenseType) {
    estimatedExpenses.forEach(function (estimatedExpense) {
      if (expenseType === estimatedExpense.expenseType) {
        totalAmount = totalAmount.add(
          Dinero({ amount: Math.round(estimatedExpense.amount * 100) })
        );
      }
    });
  } else {
    estimatedExpenses.forEach(function (estimatedExpense) {
      totalAmount = totalAmount.add(
        Dinero({ amount: Math.round(estimatedExpense.amount * 100) })
      );
    });
  }
  return totalAmount.getAmount() / 100;
}

function getTotalEstimatedSpare(estimatedExpense, salary) {
  if (salary && estimatedExpense) {
    let totalExpenses = Dinero({ amount: Math.round(estimatedExpense * 100) });
    let salaryDinero = Dinero({ amount: Math.round(salary * 100) });
    return salaryDinero.subtract(totalExpenses).getAmount() / 100;
  }
  return 0;
}
