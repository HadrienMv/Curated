const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const resourceSchema = new Schema(
  {
    rating: {
        type: Number
    },
    url: String,
    thumbnail: String,
    review: String
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Resource = model("Resource", resourceSchema);

module.exports = Resource;
