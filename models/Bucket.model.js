const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const bucketSchema = new Schema(
  {
    resources: [{type: Schema.Types.ObjectId, ref: 'Resource'}],
    name: String,
    description: String,
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    upVote: [{type: Schema.Types.ObjectId, ref: 'User'}],
    downVote: [{type: Schema.Types.ObjectId, ref: 'User'}],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Bucket = model("Bucket", bucketSchema);

module.exports = Bucket;
