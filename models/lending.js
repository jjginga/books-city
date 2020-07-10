const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const lendSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: { type: String, required: true, minlength: 5, maxlength: 50 },
      phone: { type: String, minlength: 9, maxlength: 15, match: [/^\d+$/] },
      hasBook: { type: Boolean, default: false },
    }),
  },
  book: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
      },
    }),
  },
  outDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
  returnDate: {
    type: Date,
  },
  hasReturned: {
    type: Boolean,
    default: false,
  },
  penalty: {
    type: Number,
    min: 0,
  },
});

lendSchema.statics.lookup = function (customerId, bookId) {
  return this.findOne({
    "customer._id": customerId,
    "book._id": bookId,
  });
};

lendSchema.methods.return = function () {
  if (this.dueDate < this.returnDate) {
    this.penalty = Math.floor(
      (this.returnDate - this.dueDate) / (24 * 60 * 60 * 1000)
    );
  }
};

const Lend = mongoose.model("Lend", lendSchema);

function validateLend(lend) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    bookId: Joi.objectId().required(),
  });

  return schema.validate(lend);
}

function validateExtend(lend) {
  const schema = Joi.object({
    hasReturned: Joi.boolean(),
  });

  return schema.validate(lend);
}

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    bookId: Joi.objectId().required(),
  });

  return schema.validate(req);
}

module.exports.Lend = Lend;
module.exports.validate = validateLend;
module.exports.validateExtend = validateExtend;
module.exports.validateReturn = validateReturn;
