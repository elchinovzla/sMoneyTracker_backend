const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const savingsSchema = mongoose.Schema({
  description: { type: String, required: true },
  expenseType: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

savingsSchema.index({ description: 1, createdById: 1 }, { unique: true });
savingsSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Savings', savingsSchema);
