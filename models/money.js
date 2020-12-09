const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const moneySchema = mongoose.Schema({
  description: { type: String, required: true },
  moneyType: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

moneySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Money', moneySchema);
