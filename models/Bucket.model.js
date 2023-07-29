const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const bucketSchema = new Schema(
  {
    resources: [{type: mongoose.Schema.Types.ObjectId, ref: 'Resource'}],
    name: String,
    description: String,
    upVote: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    downVote: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Bucket = model("Bucket", bucketSchema);

module.exports = Bucket;
