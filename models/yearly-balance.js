const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const yearlyBalanceSchema = mongoose.Schema({
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

yearlyBalanceSchema.index({ description: 1, createdById: 1 }, { unique: true });
yearlyBalanceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Yearly_Balance', yearlyBalanceSchema);
