const Moment = require('moment');

const Expense = require('../models/expense');
const Income = require('../models/income');
const ExpenseEstimator = require('../models/estimated-expense');
const Money = require('../models/money');
const Savings = require('../models/savings');
const YearlyBalance = require('../models/yearly-balance');

const common = require('./common');
const Dinero = common.Dinero;

const moneyType = require('./types/money');
const MONEY_TYPE = moneyType.MONEY_TYPE;
const expenseType = require('./types/expense');
const EXPENSE_TYPE = expenseType.EXPENSE_TYPE;

exports.getDetailedMonthlyInfo = (req, res, next) => {
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

function getDashboardInfo(results) {
  let dashboardInfo = [];

  for (let value in EXPENSE_TYPE) {
    let budgetAmount = Dinero({
      amount: Math.round(
        common.getTotalExpenseAmount(results[0], EXPENSE_TYPE[value]) * 100
      ),
    });
    let actualAmount = Dinero({
      amount: Math.round(
        common.getTotalExpenseAmount(results[1], EXPENSE_TYPE[value]) * 100
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

exports.getMonthSummaryBalancesByOwner = (req, res, next) => {
  let summaryInfo = {};
  const date = new Date(req.query.date);
  const startMonthDate = new Date(date.getFullYear(), date.getMonth());
  const endMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const userId = req.query.createdById;

  Promise.all([
    getExpensesInDateRange(startMonthDate, endMonthDate, userId),
    getIncomesInDateRange(startMonthDate, endMonthDate, userId),
  ])
    .then((results) => {
      if (results[0]) {
        summaryInfo.monthExpense = common.getTotalExpenseAmount(
          results[0],
          null
        );
      } else {
        summaryInfo.monthExpense = 0;
      }
      if (results[1]) {
        summaryInfo.monthIncome = common.getTotalIncome(results[1], null);
      } else {
        summaryInfo.monthIncome = 0;
      }
      res.status(200).json(summaryInfo);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get month summary balance info: ' + error,
      });
    });
};

exports.getSummaryBalancesByOwner = (req, res, next) => {
  const date = new Date(req.query.date);
  const userId = req.query.createdById;

  getBalances(res, date, userId);
};

async function getBalances(res, date, userId) {
  let summaryInfo = {};
  const startAnnualDate = new Date(date.getFullYear(), 0);
  const endAnnualDate = new Date(date.getFullYear() + 1, 0);
  const startPreviousAnnualDate = new Date(date.getFullYear() - 1, 0);
  const endPreviousAnnualDate = startAnnualDate;

  console.log(startPreviousAnnualDate);
  console.log(endPreviousAnnualDate);

  summaryInfo.annualExpense = await getAsyncExpense(
    startAnnualDate,
    endAnnualDate,
    userId
  );
  summaryInfo.annualIncome = await getAsyncIncome(
    startAnnualDate,
    endAnnualDate,
    userId
  );
  summaryInfo.previousYearBalance = await getAsyncPreviousYearBalance(
    startPreviousAnnualDate,
    endPreviousAnnualDate,
    userId
  );
  summaryInfo.currentBalance = await getAsyncCurrentBalance(
    summaryInfo.annualIncome,
    summaryInfo.annualExpense,
    summaryInfo.previousYearBalance
  );
  summaryInfo.availableMoney = await getAsyncMoneyAvailable(userId);
  summaryInfo.delta = await getAsyncDelta(
    summaryInfo.availableMoney,
    summaryInfo.currentBalance
  );

  res.status(200).json(summaryInfo);
}

async function getAsyncExpense(startDate, endDate, userId) {
  let expenses = await getExpensesInDateRange(startDate, endDate, userId);
  return common.getTotalExpenseAmount(expenses, null);
}

async function getAsyncIncome(startDate, endDate, userId) {
  let incomes = await getIncomesInDateRange(startDate, endDate, userId);
  return common.getTotalIncome(incomes, null);
}

async function getAsyncPreviousYearBalance(startDate, endDate, userId) {
  let previousYearBalances = await getPreviousYearBalance(
    startDate,
    endDate,
    userId
  );
  return common.getTotalAmount(previousYearBalances);
}

async function getAsyncCurrentBalance(
  annualIncome,
  annualExpense,
  previousYearBalanceAmount
) {
  return getCurrentBalance(
    annualIncome,
    annualExpense,
    previousYearBalanceAmount
  );
}

async function getAsyncMoneyAvailable(userId) {
  let moneyInfo = await getMoneyInTheBank(userId);
  let moneyInTheBank = common.getTotalMoneyAmount(
    moneyInfo,
    MONEY_TYPE.MONEY_IN_THE_BANK
  );
  let savings = await getSavings(userId);
  let totalSavingsAmount = common.getTotalSavingsAmount(savings, null);

  return getAvailableMoney(moneyInTheBank, totalSavingsAmount);
}

async function getAsyncDelta(moneyAvailable, currentBalance) {
  return getDelta(moneyAvailable, currentBalance);
}

function getCurrentBalance(
  yearlyIncome,
  yearlyExpenditure,
  previousYearBalance
) {
  let totalIncome = Dinero({ amount: Math.round(yearlyIncome * 100) });
  let totalExpense = Dinero({ amount: Math.round(yearlyExpenditure * 100) });
  let previousNetBalance = Dinero({
    amount: Math.round(previousYearBalance * 100),
  });

  return (
    totalIncome.add(previousNetBalance).subtract(totalExpense).getAmount() / 100
  );
}

function getAvailableMoney(moneyInTheBank, savingsAmount) {
  let moneyAvailable = Dinero({ amount: Math.round(moneyInTheBank * 100) });
  let savings = Dinero({ amount: Math.round(savingsAmount * 100) });

  return moneyAvailable.subtract(savings).getAmount() / 100;
}

function getDelta(availableMoney, currentBalance) {
  let expected = Dinero({ amount: Math.round(currentBalance * 100) });
  let actual = Dinero({ amount: Math.round(availableMoney * 100) });

  return actual.subtract(expected).getAmount() / 100;
}

function getExpensesInDateRange(startDate, endDate, userId) {
  return Expense.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: userId,
  });
}

function getIncomesInDateRange(startDate, endDate, userId) {
  return Income.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
    createdById: userId,
  });
}

function getPreviousYearBalance(startDate, endDate, userId) {
  return YearlyBalance.find({
    createdById: userId,
    startDate: {
      $lte: startDate,
    },
    endDate: {
      $gte: endDate,
    },
  });
}

function getMoneyInTheBank(userId) {
  return Money.find({
    createdById: userId,
  });
}

function getSavings(userId) {
  return Savings.find({
    createdById: userId,
  });
}
