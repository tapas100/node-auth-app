//
// ─── IMPORTS AND DECLARATIONS ───────────────────────────────────────────────────
//
import { msg } from "../../lib";
import  config from "../../../config";
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: value => {
        if (!validator.isEmail(value)) {
          throw new Error({ error: "Invalid Email address" });
        }
      }
    },
    password: {
      type: String,
      required: true,
      minLength: 7
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    roles: [{ type: String }]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, config.jwtSecretKey);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};


userSchema.methods.transform = function() {
  const transformed = {};
  const fields = ["id", "name", "email", "roles"];

  fields.forEach(field => {
    transformed[field] = this[field];
  });
  return transformed;
};
userSchema.methods.getName = function() {
  return this.name;
};

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

userSchema.statics = {
  async findByCredentials(email, password) {
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(msg("not_register"));
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error(msg("invalid_creds"));
    }
    return user;
  },

  async get(id) {
    try {
      let user = await User.findById(id);
      return user;
    } catch (error) {
      throw error;
    }
    return user;
  },
  async isEmailTaken(email) {
		let user = await User.findOne({ email }).exec();
		if (user) {
			return true;
		}
		return false;
	},
};
userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique."
});

export const User = mongoose.model("User", userSchema);
