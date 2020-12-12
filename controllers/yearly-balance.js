const YearlyBalance = require('../models/yearly-balance');
const common = require('./common');

exports.createYearlyBalance = (req, res, next) => {
  const yearlyBalance = new YearlyBalance({
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    amount: req.body.amount,
    note: req.body.note,
    createdById: req.body.createdById,
  });
  yearlyBalance
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Yearly Balance created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating yearly balance: ' + error,
      });
    });
};

exports.getYearlyBalanceEntries = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const yearlyBalanceQuery = YearlyBalance.find({
    createdById: req.query.createdById,
  }).sort([['description', 1]]);
  if (pageSize && currentPage) {
    yearlyBalanceQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  yearlyBalanceQuery
    .then((yearlyBalanceEntries) => {
      res.status(200).json({
        message: 'Yearly Balance entries fetched successfully',
        yearlyBalanceEntries: yearlyBalanceEntries,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get yearly balance: ' + error,
      });
    });
};

exports.getTotalYearlyBalanceRecords = (req, res, next) => {
  YearlyBalance.find({
    createdById: req.params.createdById,
  }).then((yearlyBalanceEntries) => {
    if (yearlyBalanceEntries) {
      res.status(200).json({
        yearlyBalanceTotalCount: common.getTotal(yearlyBalanceEntries),
      });
    } else {
      res.status(200).json({
        yearlyBalanceTotalCount: 0,
      });
    }
  });
};

exports.getYearlyBalanceById = (req, res, next) => {
  YearlyBalance.findById(req.params.id)
    .then((yearlyBalanceEntries) => {
      if (yearlyBalanceEntries) {
        res.status(200).json(yearlyBalanceEntries);
      } else {
        res.status(400).json({
          message: 'Yearly Balance not found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get yearly balance by id: ' + error,
      });
    });
};

exports.updateYearlyBalance = (req, res, next) => {
  YearlyBalance.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      amount: req.body.amount,
      note: req.body.note,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Yearly Balance updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update yearly balance: ' + error,
      });
    });
};

exports.deleteYearlyBalance = (req, res, next) => {
  YearlyBalance.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Yearly balance deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete yearly balance: ' + error,
      });
    });
};
