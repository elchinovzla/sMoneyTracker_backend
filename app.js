const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const expenseEstimatorRoutes = require('./routes/expense-estimator');
const incomeRoutes = require('./routes/income');
const moneyRoutes = require('./routes/money');
const savingsRoutes = require('./routes/savings');
const expenseRoutes = require('./routes/expense');
const yearlyBalanceRoutes = require('./routes/yearly-balance');
const dashboardRoutes = require('./routes/dashboard');
const salaryRoutes = require('./routes/salary');
const reportRoutes = require('./routes/report');

const app = express();

mongoose
  .connect(
    'mongodb+srv://' +
      process.env.MONGO_USER_NAME +
      ':' +
      process.env.MONGO_PASSWORD +
      process.env.MONGO_CLUSTER,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/user', userRoutes);
app.use('/api/expense-estimator', expenseEstimatorRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/money', moneyRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/yearly-balance', yearlyBalanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/report', reportRoutes);

module.exports = app;
