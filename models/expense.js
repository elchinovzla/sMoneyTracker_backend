const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const expenseSchema = mongoose.Schema({
  description: { type: String, required: true },
  expenseType: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  savingsId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Savings'
  },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

expenseSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Expense', expenseSchema);
