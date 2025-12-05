// a mongoose model of an admin
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtStrategy = require("../config/jwt-config.js"); // import setup options for using JWT in passport

// admin schema
const adminSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

// hash the password before the admin is saved
// mongoose provides hooks that allow us to run code before or after specific events
//changed to async since next() is outdated
adminSchema.pre("save", async function () {
  const user = this;
  // if the password has not changed, no need to hash it
  if (!user.isModified("password")) return;
  // otherwise, the password is being modified, so hash it
  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash; // update the password to the hashed version
  } catch (err) {
    throw err;
  }
});

// compare a given password with the database hash
adminSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// return a JWT token for the admin
adminSchema.methods.generateJWT = function () {
  const today = new Date();
  const exp = new Date(today);

  exp.setDate(today.getDate() + process.env.JWT_EXP_DAYS); // assuming an environment variable with num days in it

  return jwt.sign(
    {
      userid: this._id,
      email: this.email,
      role: "admin",
      exp: parseInt(exp.getTime() / 1000),
    },
    process.env.JWT_SECRET
  );
};

// return the admin information without sensitive data
adminSchema.methods.toAuthJSON = function () {
  return {
    email: this.email,
    token: this.generateJWT(),
  };
};

// create a model from this schema + export
module.exports = mongoose.model("Admin", adminSchema);
