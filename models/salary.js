const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const salarySchema = mongoose.Schema({
  salaryType: { type: String, required: true },
  amount: { type: Number, required: true },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  }
});

salarySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Salary', salarySchema);
