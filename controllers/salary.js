const Salary = require('../models/salary');
const common = require('./common');
const { SALARY_TYPE } = require('./types/salary');
const Dinero = common.Dinero;

exports.createSalary = (req, res) => {
  const salary = new Salary({
    description: req.body.description,
    salaryType: req.body.salaryType,
    amount: req.body.amount,
    note: req.body.note,
    createdById: req.body.createdById,
  });
  salary
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Salary created',
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error creating salary: ' + error,
      });
    });
};

exports.getSalaryEntries = (req, res) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const salaryQuery = Salary.find({
    createdById: req.query.createdById,
  }).sort([['description', 1]]);
  if (pageSize && currentPage) {
    salaryQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  salaryQuery
    .then((salaryEntries) => {
      res.status(200).json({
        message: 'Salary entries fetched successfully',
        salaryEntries: salaryEntries,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get salary entries: ' + error,
      });
    });
};

exports.getTotalSalaryRecords = (req, res, next) => {
  Salary.find({
    createdById: req.params.createdById,
  }).then((salaryEntries) => {
    if (salaryEntries) {
      res.status(200).json({
        salaryTotalCount: common.getTotal(salaryEntries),
      });
    } else {
      res.status(200).json({
        salaryTotalCount: 0,
      });
    }
  });
};

exports.getSalaryById = (req, res) => {
  Salary.findById(req.params.id)
    .then((salary) => {
      if (salary) {
        res.status(200).json(salary);
      } else {
        res.status(400).json({ message: 'Salary not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to get salary: ' + error,
      });
    });
};

exports.updateSalary = (req, res) => {
  Salary.findOneAndUpdate(
    { _id: req.body.id },
    {
      description: req.body.description,
      salaryType: req.body.salaryType,
      amount: req.body.amount,
      note: req.body.note,
    }
  )
    .then(() => {
      res.status(201).json({
        message: 'Salary updated',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to update salary: ' + error,
      });
    });
};

exports.getMonthlySalaryAmount = (req, res) => {
  const createdById = req.params.createdById;

  getAsyncResMonthlySalaryAmount(res, createdById);
};

async function getAsyncResMonthlySalaryAmount(res, createdById) {
  const monthlySalaryAmount = await getMonthlySalaryAmountFromSalaries(
    createdById
  );
  res.status(200).json({
    monthlySalaryAmount,
  });
}

exports.getMonthlySalary = (createdById) => {
  return getMonthlySalaryAmountFromSalaries(createdById);
};

async function getMonthlySalaryAmountFromSalaries(createdById) {
  const totalMonthlySalaryAmount = await getAsyncMonthlySalary(createdById);

  return totalMonthlySalaryAmount;
}

async function getAsyncMonthlySalary(createdById) {
  let salaries = await getSalaries(createdById);
  return getMonthSalaryAmountFromSalaries(salaries);
}

function getSalaries(createdById) {
  return Salary.find({
    createdById: createdById,
  });
}

function getMonthSalaryAmountFromSalaries(salaries) {
  let totalMonthlySalaryAmount = Dinero({ amount: 0 });

  salaries.forEach(function (salary) {
    const monthlySalaryAmount = convertSalaryIntoMonthlySalary(salary);

    totalMonthlySalaryAmount = totalMonthlySalaryAmount.add(
      Dinero({
        amount: Math.round(monthlySalaryAmount * 100),
      })
    );
  });

  return totalMonthlySalaryAmount.getAmount() / 100;
}

function convertSalaryIntoMonthlySalary(salary) {
  let salaryAmount = Dinero({ amount: Math.round(salary.amount * 100) });
  switch (salary.salaryType) {
    case SALARY_TYPE.WEEKLY: {
      salaryAmount = salaryAmount.multiply(52).divide(12);
      break;
    }
    case SALARY_TYPE.BI_WEEKLY: {
      salaryAmount = salaryAmount.multiply(13).divide(6);
      break;
    }
    case SALARY_TYPE.SEMI_MONTHLY: {
      salaryAmount = salaryAmount.multiply(2);
      break;
    }
    default: {
      break;
    }
  }

  return salaryAmount.getAmount() / 100;
}

exports.deleteSalary = (req, res, next) => {
  Salary.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Salary deleted',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Failed to delete salary: ' + error,
      });
    });
};
