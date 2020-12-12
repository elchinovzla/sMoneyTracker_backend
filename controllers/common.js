const Dinero = require('dinero.js');
Dinero.defaultCurrency = 'CAD';
const moneyType = require('./types/money');
const MONEY_TYPE = moneyType.MONEY_TYPE;

function getTotal(entries) {
  let totalCount = 0;
  entries.forEach(function () {
    totalCount++;
  });
  return totalCount;
}

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

function getTotalIncome(incomes) {
  let totalAmount = Dinero({ amount: 0 });
  incomes.forEach(function (income) {
    totalAmount = totalAmount.add(
      Dinero({ amount: Math.round(income.amount * 100) })
    );
  });
  return totalAmount.getAmount() / 100;
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

function getTotalAmount(entries) {
  let totalAmount = Dinero({ amount: 0 });

  entries.forEach(function (entry) {
    totalAmount = totalAmount.add(
      Dinero({ amount: Math.round(entry.amount * 100) })
    );
  });

  return totalAmount.getAmount() / 100;
}

module.exports = {
  getTotal,
  getTotalExpenseAmount,
  getTotalMoneyAmount,
  getTotalSavingsAmount,
  getTotalIncome,
  getTotalAmount,
  Dinero,
};
