const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const salarySchema = mongoose.Schema({
  description: { type: String, required: true },
  salaryType: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, required: false },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

salarySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Salary', salarySchema);
