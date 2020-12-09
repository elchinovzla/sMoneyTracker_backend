const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const incomeSchema = mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

incomeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Income', incomeSchema);
