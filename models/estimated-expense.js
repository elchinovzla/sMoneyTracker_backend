const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const estimatedExpenseSchema = mongoose.Schema({
  description: { type: String, required: true },
  expenseType: { type: String, required: true },
  amount: { type: Number, required: true },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

estimatedExpenseSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Estimated_Expense', estimatedExpenseSchema);
