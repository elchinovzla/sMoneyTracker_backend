const Money = require('../models/money');
const Dinero = require('dinero.js');
Dinero.defaultCurrency = 'CAD';
const MONEY_TYPE = {
  MONEY_IN_THE_BANK: 'MONEY_IN_THE_BANK',
  MONEY_INVESTED: 'MONEY_INVESTED',
  UNCLAIMED: 'UNCLAIMED',
  OTHER: 'OTHER',
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  RRSP: 'RRSP',
  TFSA: 'TFSA',
  CASH: 'CASH',
  GIFT_CARD: 'GIFT_CARD',
};
const common = require('./common');

exports.createMoney = (req, res, next) => {
  const money = new Money({
    description: req.body.description,
    moneyType: req.body.moneyType,
    amount: req.body.amount,
    note: req.body.note,
    createdById: req.body.createdById,
  });
  money
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Money created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating money: ' + error,
      });
    });
};

exports.getMoneyEntries = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const moneyQuery = Money.find({
    createdById: req.query.createdById,
  }).sort([['description', 1]]);
  if (pageSize && currentPage) {
    moneyQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  moneyQuery
    .then((moneyEntries) => {
      res.status(200).json({
        message: 'Money fetched successfully',
        moneyEntries: moneyEntries,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get money: ' + error,
      });
    });
};

exports.getTotalMoneyRecords = (req, res, next) => {
  Money.find({
    createdById: req.params.createdById,
  }).then((moneyEntries) => {
    if (moneyEntries) {
      res.status(200).json({
        moneyTotalCount: common.getTotal(moneyEntries),
      });
    } else {
      res.status(200).json({
        moneyTotalCount: 0,
      });
    }
  });
};

exports.getMoney = (req, res, next) => {
  Money.findById(req.params.id)
    .then((moneyEntries) => {
      if (moneyEntries) {
        res.status(200).json(moneyEntries);
      } else {
        res.status(400).json({
          message: 'Money not found',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get money: ' + error,
      });
    });
};

exports.getMoneyInfo = (req, res, next) => {
  Money.find({
    createdById: req.params.id,
  })
    .then((moneyEntries) => {
      if (moneyEntries) {
        res.status(200).json({
          moneyInTheBank: getTotalMoneyAmount(
            moneyEntries,
            MONEY_TYPE.MONEY_IN_THE_BANK
          ),
          moneyInvested: getTotalMoneyAmount(
            moneyEntries,
            MONEY_TYPE.MONEY_INVESTED
          ),
          moneyUnclaimed: getTotalMoneyAmount(
            moneyEntries,
            MONEY_TYPE.UNCLAIMED
          ),
          moneyOther: getTotalMoneyAmount(moneyEntries, MONEY_TYPE.OTHER),
          moneyInChecking: getTotalMoneyAmount(
            moneyEntries,
            MONEY_TYPE.CHECKING
          ),
          moneyInSavings: getTotalMoneyAmount(moneyEntries, MONEY_TYPE.SAVINGS),
          moneyInRrsp: getTotalMoneyAmount(moneyEntries, MONEY_TYPE.RRSP),
          moneyInTfsa: getTotalMoneyAmount(moneyEntries, MONEY_TYPE.TFSA),
          moneyCash: getTotalMoneyAmount(moneyEntries, MONEY_TYPE.CASH),
          moneyGiftCard: getTotalMoneyAmount(
            moneyEntries,
            MONEY_TYPE.GIFT_CARD
          ),
        });
      } else {
        res.status(200).json({
          message: 'Could not find any money entry for user',
          moneyInTheBank: 0,
          moneyInvested: 0,
          moneyUnclaimed: 0,
          moneyOther: 0,
          moneyInChecking: 0,
          moneyInSavings: 0,
          moneyInRrsp: 0,
          moneyInTfsa: 0,
          moneyCash: 0,
          moneyGiftCard: 0,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get a Money Info: ' + error,
      });
    });
};

exports.updateMoney = (req, res, next) => {
  Money.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      moneyType: req.body.moneyType,
      amount: req.body.amount,
      note: req.body.note,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Money updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update money: ' + error,
      });
    });
};

exports.deleteMoney = (req, res, next) => {
  Money.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Money deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete money: ' + error,
      });
    });
};

function getDinero(moneyEntries, moneyType) {
  let totalAmount = Dinero({ amount: 0 });
  moneyEntries.forEach(function (moneyEntry) {
    if (moneyType === moneyEntry.moneyType) {
      totalAmount = totalAmount.add(
        Dinero({ amount: Math.round(moneyEntry.amount * 100) })
      );
    }
  });
  return totalAmount;
}

function getTotalMoneyAmount(moneyEntries, moneyType) {
  let totalAmount = Dinero({ amount: 0 });
  switch (moneyType) {
    case MONEY_TYPE.MONEY_IN_THE_BANK: {
      totalAmount = totalAmount.add(
        getDinero(moneyEntries, MONEY_TYPE.CHECKING)
      );
      totalAmount = totalAmount.add(
        getDinero(moneyEntries, MONEY_TYPE.SAVINGS)
      );
      break;
    }
    case MONEY_TYPE.MONEY_INVESTED: {
      totalAmount = totalAmount.add(getDinero(moneyEntries, MONEY_TYPE.RRSP));
      totalAmount = totalAmount.add(getDinero(moneyEntries, MONEY_TYPE.TFSA));
      break;
    }
    case MONEY_TYPE.OTHER: {
      totalAmount = totalAmount.add(getDinero(moneyEntries, MONEY_TYPE.CASH));
      totalAmount = totalAmount.add(
        getDinero(moneyEntries, MONEY_TYPE.GIFT_CARD)
      );
      break;
    }
    default: {
      totalAmount = totalAmount.add(getDinero(moneyEntries, moneyType));
      break;
    }
  }
  return totalAmount.getAmount() / 100;
}
