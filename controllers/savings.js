const Savings = require('../models/savings');
const Dinero = require('dinero.js');
Dinero.defaultCurrency = 'CAD';
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

exports.createSavings = (req, res, next) => {
  const savings = new Savings({
    description: req.body.description,
    expenseType: req.body.expenseType,
    amount: req.body.amount,
    note: req.body.note,
    createdById: req.body.createdById,
  });
  savings
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Savings created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating savings: ' + error,
      });
    });
};

exports.getSavingsEntries = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const savingsQuery = Savings.find({
    createdById: req.query.createdById,
  }).sort([['description', 1]]);
  if (pageSize && currentPage) {
    savingsQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  savingsQuery
    .then((savingsEntries) => {
      res.status(200).json({
        message: 'Savings fetched successfully',
        savingsEntries: savingsEntries,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get savings: ' + error,
      });
    });
};

exports.getTotalSavingsRecords = (req, res, next) => {
  Savings.find({
    createdById: req.params.createdById,
  }).then((savingsEntries) => {
    if (savingsEntries) {
      res.status(200).json({
        savingsTotalCount: common.getTotal(savingsEntries),
      });
    } else {
      res.status(200).json({
        savingsTotalCount: 0,
      });
    }
  });
};

exports.getSavingsById = (req, res, next) => {
  Savings.findById(req.params.id)
    .then((savingsEntries) => {
      if (savingsEntries) {
        res.status(200).json(savingsEntries);
      } else {
        res.status(400).json({
          message: 'Savings not found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get savings: ' + error,
      });
    });
};

exports.getSavingsInfo = (req, res, next) => {
  Savings.find({
    createdById: req.params.createdById,
  })
    .then((savingsEntries) => {
      if (savingsEntries) {
        res.status(200).json({
          totalSavingsAmount: getTotalSavingsAmount(savingsEntries, null),
          totalSavingsDineOutAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.DINE_OUT
          ),
          totalSavingsGiftAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.GIFT
          ),
          totalSavingsGroceryAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.GROCERY
          ),
          totalSavingsHouseAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.HOUSE
          ),
          totalSavingsMembershipAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.MEMBERSHIP
          ),
          totalSavingsOtherAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.OTHER
          ),
          totalSavingsTransportationAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.TRANSPORTATION
          ),
          totalSavingsTravelAmount: getTotalSavingsAmount(
            savingsEntries,
            EXPENSE_TYPE.TRAVEL
          ),
        });
      } else {
        res.status(200).json({
          message: 'Could not find any savings entry for user',
          totalSavingsAmount: 0,
          totalSavingsDineOutAmount: 0,
          totalSavingsGiftAmount: 0,
          totalSavingsGroceryAmount: 0,
          totalSavingsHouseAmount: 0,
          totalSavingsMembershipAmount: 0,
          totalSavingsOtherAmount: 0,
          totalSavingsTransportationAmount: 0,
          totalSavingsTravelAmount: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get a Savings Info: ' + error,
      });
    });
};

exports.updateSavings = (req, res, next) => {
  Savings.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      expenseType: req.body.expenseType,
      amount: req.body.amount,
      note: req.body.note,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Savings updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update savings: ' + error,
      });
    });
};

exports.deleteSavings = (req, res, next) => {
  Savings.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Savings deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete savings: ' + error,
      });
    });
};

function getTotalSavingsAmount(savingsEntries, expenseType) {
  let totalAmount = Dinero({ amount: 0 });
  if (expenseType) {
    savingsEntries.forEach(function (savingsEntry) {
      if (expenseType === savingsEntry.expenseType) {
        totalAmount = totalAmount.add(
          Dinero({ amount: Math.round(savingsEntry.amount * 100) })
        );
      }
    });
  } else {
    savingsEntries.forEach(function (savingsEntry) {
      totalAmount = totalAmount.add(
        Dinero({ amount: Math.round(savingsEntry.amount * 100) })
      );
    });
  }
  return totalAmount.getAmount() / 100;
}
