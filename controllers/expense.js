const Expense = require('../models/expense');
const ExpenseEstimator = require('../models/estimated-expense');
const Dinero = require('dinero.js');
Dinero.defaultCurrency = 'CAD';
const Moment = require('moment');
const EXPENSE_TYPE = {
  DINE_OUT: 'DINE_OUT',
  GIFT: 'GIFT',
  GROCERY: 'GROCERY',
  HOUSE: 'HOUSE',
  MEMBERSHIP: 'MEMBERSHIP',
  OTHER: 'OTHER',
  TRANSPORTATION: 'TRANSPORTATION',
  TRAVEL: 'TRAVEL',
};
const common = require('./common');

exports.createExpense = (req, res, next) => {
  const expense = new Expense({
    description: req.body.description,
    expenseType: req.body.expenseType,
    amount: req.body.amount,
    date: req.body.date,
    savingsId: req.body.savingsId == '' ? null : req.body.savingsId,
    note: req.body.note,
    createdById: req.body.createdById,
  });
  expense
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Expense created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating expense: ' + error,
      });
    });
};

exports.getExpenses = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  const expenseType = req.query.expenseType;
  const expenseQuery = Expense.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: req.query.createdById,
  }).sort([
    ['date', -1],
    ['description', 1],
  ]);
  if (pageSize && currentPage) {
    expenseQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  if (expenseType) {
    expenseQuery.where('expenseType', expenseType);
  }
  expenseQuery
    .then((expenses) => {
      res.status(200).json({
        message: 'Expenses fetched successfully',
        expenses: expenses,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get expenses: ' + error,
      });
    });
};

exports.getTotalExpenseRecordsCount = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  const expenseType = req.query.expenseType;
  const expenseQuery = Expense.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: req.query.createdById,
  });
  if (expenseType) {
    expenseQuery.where('expenseType', expenseType);
  }
  expenseQuery
    .then((expenses) => {
      if (expenses) {
        res.status(200).json({
          totalCount: common.getTotal(expenses),
        });
      } else {
        res.status(200).json({
          totalCount: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get total expenses: ' + error,
      });
    });
};

exports.getExpenseById = (req, res, next) => {
  Expense.findById(req.params.id)
    .then((expenses) => {
      if (expenses) {
        res.status(200).json(expenses);
      } else {
        res.status(400).json({
          message: 'Expense not found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get expense: ' + error,
      });
    });
};

exports.getMonthlyExpenseInfo = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  Expense.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: req.query.createdById,
  })
    .then((expenses) => {
      if (expenses) {
        res.status(200).json({
          totalExpenseAmount: getTotalExpenseAmount(expenses, null),
          totalExpenseDineOutAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.DINE_OUT
          ),
          totalExpenseGiftAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.GIFT
          ),
          totalExpenseGroceryAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.GROCERY
          ),
          totalExpenseHouseAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.HOUSE
          ),
          totalExpenseMembershipAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.MEMBERSHIP
          ),
          totalExpenseOtherAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.OTHER
          ),
          totalExpenseTransportationAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.TRANSPORTATION
          ),
          totalExpenseTravelAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.TRAVEL
          ),
        });
      } else {
        res.status(200).json({
          message:
            'Could not find any expense entry for user within selected month',
          totalExpenseAmount: 0,
          totalExpenseDineOutAmount: 0,
          totalExpenseGiftAmount: 0,
          totalExpenseGroceryAmount: 0,
          totalExpenseHouseAmount: 0,
          totalExpenseMembershipAmount: 0,
          totalExpenseOtherAmount: 0,
          totalExpenseTransportationAmount: 0,
          totalExpenseTravelAmount: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message:
          'Failed to get a Expense Info for the specified month: ' + error,
      });
    });
};

exports.getAnnualExpenseInfo = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), 0);
  const endDate = Moment(startDate).add(1, 'year').toDate();
  Expense.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: req.query.createdById,
  })
    .then((expenses) => {
      if (expenses) {
        res.status(200).json({
          totalExpenseAmount: getTotalExpenseAmount(expenses, null),
          totalExpenseDineOutAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.DINE_OUT
          ),
          totalExpenseGiftAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.GIFT
          ),
          totalExpenseGroceryAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.GROCERY
          ),
          totalExpenseHouseAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.HOUSE
          ),
          totalExpenseMembershipAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.MEMBERSHIP
          ),
          totalExpenseOtherAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.OTHER
          ),
          totalExpenseTransportationAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.TRANSPORTATION
          ),
          totalExpenseTravelAmount: getTotalExpenseAmount(
            expenses,
            EXPENSE_TYPE.TRAVEL
          ),
        });
      } else {
        res.status(200).json({
          message:
            'Could not find any expense entry for user within selected year',
          totalExpenseAmount: 0,
          totalExpenseDineOutAmount: 0,
          totalExpenseGiftAmount: 0,
          totalExpenseGroceryAmount: 0,
          totalExpenseHouseAmount: 0,
          totalExpenseMembershipAmount: 0,
          totalExpenseOtherAmount: 0,
          totalExpenseTransportationAmount: 0,
          totalExpenseTravelAmount: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message:
          'Failed to get a Expense Info for the specified year: ' + error,
      });
    });
};

exports.getDashboardInfo = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  Promise.all([
    ExpenseEstimator.find({
      createdById: req.query.createdById,
    }),
    Expense.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      createdById: req.query.createdById,
    }),
  ])
    .then((results) => {
      res.status(200).json({
        dashboardData: getDashboardInfo(results),
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get dashboard info: ' + error,
      });
    });
};

exports.updateExpense = (req, res, next) => {
  Expense.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      expenseType: req.body.expenseType,
      amount: req.body.amount,
      date: req.body.date,
      savingsId: req.body.savingsId == '' ? null : req.body.savingsId,
      note: req.body.note,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Expense updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update expense: ' + error,
      });
    });
};

exports.deleteExpense = (req, res, next) => {
  Expense.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Expense deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete expense: ' + error,
      });
    });
};

function getTotalExpenseAmount(expenses, expenseType) {
  let totalAmount = Dinero({ amount: 0 });
  if (expenseType) {
    expenses.forEach(function (expense) {
      if (expenseType === expense.expenseType) {
        totalAmount = totalAmount.add(
          Dinero({ amount: Math.round(expense.amount * 100) })
        );
      }
    });
  } else {
    expenses.forEach(function (expense) {
      totalAmount = totalAmount.add(
        Dinero({ amount: Math.round(expense.amount * 100) })
      );
    });
  }
  return totalAmount.getAmount() / 100;
}

function getDashboardInfo(results) {
  let dashboardInfo = [];
  for (let value in EXPENSE_TYPE) {
    let budgetAmount = Dinero({
      amount: Math.round(
        getTotalExpenseAmount(results[0], EXPENSE_TYPE[value]) * 100
      ),
    });
    let actualAmount = Dinero({
      amount: Math.round(
        getTotalExpenseAmount(results[1], EXPENSE_TYPE[value]) * 100
      ),
    });
    let difference = budgetAmount.subtract(actualAmount);
    dashboardInfo.push({
      expenseType: EXPENSE_TYPE[value],
      actualAmount: actualAmount.getAmount() / 100,
      budgetAmount: budgetAmount.getAmount() / 100,
      difference: difference.getAmount() / 100,
    });
  }
  return dashboardInfo;
}
