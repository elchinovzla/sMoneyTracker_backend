const Expense = require('../models/expense');
const income = require('../models/income');
const Income = require('../models/income');

const common = require('./common');

exports.getOnlyExpenses = (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const keyword = req.query.keyword;
  const createdById = req.query.createdById;

  if (keyword) {
    getExpensesWithKeyword(res, startDate, endDate, keyword, createdById);
  } else {
    getExpensesWithoutKeyword(res, startDate, endDate, createdById);
  }
};

exports.getOnlyIncomes = (req, res) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);
  const keyword = req.query.keyword;
  const createdById = req.query.createdById;

  if (keyword) {
    getIncomesWithKeyword(res, startDate, endDate, keyword, createdById);
  } else {
    getIncomesWithoutKeyword(res, startDate, endDate, createdById);
  }
};

exports.getSummary = (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const createdById = req.query.createdById;

  getAsyncSummary(res, startDate, endDate, createdById);
};

async function convertExpensesToTransactions(entries) {
  return entries.map((entry) => ({
    id: entry._id,
    date: entry.date,
    transactionDescription: entry.description,
    transactionAmount: entry.amount,
    transactionType: entry.expenseType,
  }));
}

async function convertIncomesToTransactions(entries) {
  return entries.map((entry) => ({
    id: entry._id,
    date: entry.date,
    transactionDescription: entry.name,
    transactionAmount: entry.amount,
    transactionType: 'INCOME',
  }));
}

async function getExpensesWithKeyword(
  res,
  startDate,
  endDate,
  keyword,
  createdById
) {
  const expenses = await getAllExpensesWithKeyword(
    startDate,
    endDate,
    keyword,
    createdById
  );
  const totalOutcome = common.getTotalExpenseAmount(expenses, null);
  const transactions = await convertExpensesToTransactions(expenses);

  res.status(200).json({
    message: 'Only Expenses Report data fetched',
    reportData: {
      reportName: 'Expense Report for ' + keyword,
      fromDate: startDate,
      toDate: endDate,
      totalIncome: 0,
      totalOutcome: totalOutcome,
      transactions: transactions,
    },
  });
}

async function getExpensesWithoutKeyword(res, startDate, endDate, createdById) {
  const expenses = await getAllExpenses(startDate, endDate, createdById);
  const totalOutcome = common.getTotalExpenseAmount(expenses, null);
  const transactions = await convertExpensesToTransactions(expenses);

  res.status(200).json({
    message: 'Only Expenses Report data fetched',
    reportData: {
      reportName: 'Expense Report',
      fromDate: startDate,
      toDate: endDate,
      totalIncome: 0,
      totalOutcome: totalOutcome,
      transactions: transactions,
    },
  });
}

async function getAllExpenses(startDate, endDate, createdById) {
  return Expense.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    createdById: createdById,
  }).sort([
    ['date', -1],
    ['description', 1],
  ]);
}

async function getAllExpensesWithKeyword(
  startDate,
  endDate,
  keyword,
  createdById
) {
  return Expense.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    createdById: createdById,
    $or: [
      {
        description: {
          $regex: '.*' + keyword + '.*',
          $options: 'i',
        },
      },
      {
        note: {
          $regex: '.*' + keyword + '.*',
          $options: 'i',
        },
      },
    ],
  }).sort([
    ['date', -1],
    ['description', 1],
  ]);
}

async function getIncomesWithKeyword(
  res,
  startDate,
  endDate,
  keyword,
  createdById
) {
  const incomes = await getAllIncomesWithKeyword(
    startDate,
    endDate,
    keyword,
    createdById
  );
  const totalIncome = common.getTotalIncome(incomes);
  const transactions = await convertIncomesToTransactions(incomes);
  res.status(200).json({
    message: 'Only Incomes Report data fetched',
    reportData: {
      reportName: 'Income Report for ' + keyword,
      fromDate: startDate,
      toDate: endDate,
      totalIncome: totalIncome,
      totalOutcome: 0,
      transactions: transactions,
    },
  });
}

async function getIncomesWithoutKeyword(res, startDate, endDate, createdById) {
  const incomes = await getAllIncomes(startDate, endDate, createdById);
  const totalIncome = common.getTotalIncome(incomes);
  const transactions = await convertIncomesToTransactions(incomes);
  res.status(200).json({
    message: 'Only Incomes Report data fetched',
    reportData: {
      reportName: 'Income Report',
      fromDate: startDate,
      toDate: endDate,
      totalIncome: totalIncome,
      totalOutcome: 0,
      transactions: transactions,
    },
  });
}

async function getAllIncomes(startDate, endDate, createdById) {
  return Income.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    createdById: createdById,
  }).sort([
    ['date', -1],
    ['description', 1],
  ]);
}

async function getAllIncomesWithKeyword(
  startDate,
  endDate,
  keyword,
  createdById
) {
  return Income.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    createdById: createdById,
    $or: [
      {
        name: {
          $regex: '.*' + keyword + '.*',
          $options: 'i',
        },
      },
      {
        note: {
          $regex: '.*' + keyword + '.*',
          $options: 'i',
        },
      },
    ],
  }).sort([
    ['date', -1],
    ['description', 1],
  ]);
}

async function getMergedTransactions(expenses, incomes) {
  const allTransactions = [...expenses, ...incomes].sort(
    (a, b) => b.date - a.date
  );
  console.log(allTransactions);

  return allTransactions;
}

async function getAsyncSummary(res, startDate, endDate, createdById) {
  const expenses = await getAllExpenses(startDate, endDate, createdById);
  const incomes = await getAllIncomes(startDate, endDate, createdById);

  const totalIncome = common.getTotalIncome(incomes);
  const totalOutcome = common.getTotalExpenseAmount(expenses, null);
  console.log(totalIncome);
  console.log(totalOutcome);
  const expensesTransactions = await convertExpensesToTransactions(expenses);
  const incomeTransactions = await convertIncomesToTransactions(incomes);
  const transactions = await getMergedTransactions(
    expensesTransactions,
    incomeTransactions
  );

  res.status(200).json({
    message: 'Summary Report data fetched',
    reportData: {
      reportName: 'Summary Report',
      fromDate: startDate,
      toDate: endDate,
      totalIncome: totalIncome,
      totalOutcome: totalOutcome,
      transactions: transactions,
    },
  });
}
