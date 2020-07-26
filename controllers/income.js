const Income = require('../models/income');
const Dinero = require('dinero.js');
Dinero.defaultCurrency = 'CAD';
const Moment = require('moment');

exports.createIncome = (req, res, next) => {
  const income = new Income({
    name: req.body.name,
    amount: req.body.amount,
    date: req.body.date,
    note: req.body.note,
    createdById: req.body.createdById
  });
  income
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Income created',
        result: result
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Error creating income: ' + error
      });
    });
};

exports.getIncomeById = (req, res, next) => {
  Income.findById(req.params.id)
    .then(income => {
      if (income) {
        res.status(200).json(income);
      } else {
        res.status(400).json({ message: 'Earning not found' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to get income: ' + error
      });
    });
};

exports.getIncomes = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  const incomeQuery = Income.find({
    date: {
      $gte: startDate,
      $lt: endDate
    },
    createdById: req.query.createdById
  }).sort([['date', -1], ['name', 1]]);
  if (pageSize && currentPage) {
    incomeQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  incomeQuery
    .then(incomes => {
      res.status(200).json({
        message: 'Income fetched successfully',
        incomes: incomes
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to get incomes: ' + error
      });
    });
};

exports.getTotalCountIncome = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  Income.find({
    date: {
      $gte: startDate,
      $lt: endDate
    },
    createdById: req.query.createdById
  }).then(
    incomes => {
      if (incomes) {
        res.status(200).json({
          maxIncomes: getTotal(incomes)
        });
      } else {
        res.status(200).json({
          maxIncomes: 0
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to get total incomes: ' + error
      });
    });
};

exports.getMonthlyIncomeByOwner = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), date.getMonth());
  const endDate = Moment(startDate).add(1, 'month').toDate();
  Income.find({
    date: {
      $gte: startDate,
      $lt: endDate
    },
    createdById: req.query.createdById
  })
    .then(incomes => {
      if (incomes) {
        res.status(200).json({
          monthlyIncome: getTotalIncome(
            incomes
          )
        });
      } else {
        res.status(200).json({
          message: 'Could not find any income',
          monthlyIncome: 0
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to get an income: ' + error
      });
    });
};

exports.getAnnualIncomeByOwner = (req, res, next) => {
  const date = new Date(req.query.date);
  const startDate = new Date(date.getFullYear(), 0);
  const endDate = Moment(startDate).add(1, 'year').toDate();
  Income.find({
    date: {
      $gte: startDate,
      $lt: endDate
    },
    createdById: req.query.createdById
  })
    .then(incomes => {
      if (incomes) {
        res.status(200).json({
          annualIncome: getTotalIncome(
            incomes
          )
        });
      } else {
        res.status(200).json({
          message: 'Could not find any income',
          annualIncome: 0
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to get an income: ' + error
      });
    });
};

exports.updateIncome = (req, res, next) => {
  Income.findOneAndUpdate(
    { _id: req.body.id },
    {
      name: req.body.name,
      amount: req.body.amount,
      date: req.body.date,
      note: req.body.note
    })
    .then(() => {
      res.status(201).json({
        message: 'Income updated'
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to update income: ' + error
      });
    });
};

exports.deleteIncome = (req, res, next) => {
  Income.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Income deleted'
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to delete income: ' + error
      });
    });
};

function getTotal(estimatedExpenses) {
  let totalCount = 0;
  estimatedExpenses.forEach(function () {
    totalCount++;
  });
  return totalCount;
}

function getTotalIncome(incomes) {
  let totalAmount = Dinero({ amount: 0 });
  incomes.forEach(function (income) {
    totalAmount = totalAmount.add(
      Dinero({ amount: Math.round(income.amount * 100) })
    );
  });
  return totalAmount.getAmount() / 100;
}
