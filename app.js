const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const expenseEstimatorRoutes = require('./routes/expense-estimator');
const incomeRoutes = require('./routes/income');
const moneyRoutes = require('./routes/money');
const savingsRoutes = require('./routes/savings');
const expenseRoutes = require('./routes/expense');
const dbCredentials = require('./middleware/db-credentials');

const app = express();

mongoose
  .connect(
    'mongodb+srv://' +
    dbCredentials.USER_NAME +
    ':' +
    dbCredentials.PASSWORD +
    '@cluster0-fkcx5.mongodb.net/smoney-tracker',
    {
      useNewUrlParser: true
    }
  )
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

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

module.exports = app;
