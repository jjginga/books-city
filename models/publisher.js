const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Publisher = mongoose.model("Publisher", publisherSchema);

function validatePublisher(publisher) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(publisher);
}

module.exports.Publisher = Publisher;
module.exports.publisherSchema = publisherSchema;
module.exports.validatePublisher = validatePublisher;
