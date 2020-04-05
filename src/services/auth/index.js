import { ObjectID } from "mongodb";
import { User } from "../../models";
import { AuthHeader, ROLES, msg, APIError } from "../../lib";
const HttpStatus = require("http-status-codes");
const https = require("https");

class Auth {
  /**
   * * It'll give you authentication token.
   * @param {*} data //contains credential as email and password
   */
  async login(data) {
    try {
      console.log("here 1");
      const { email, password } = data;
      let user = await User.findByCredentials(email, password);
      console.log("here 2");
      console.dir(msg);
      if (!user) {
        throw new APIError({
          message: msg("invalid_login"),
          status: HttpStatus.UNAUTHORIZED
        });
      }
      const token = await user.generateAuthToken();
      user = user.transform();
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {*} data // contains user data fields for registration
   */

  async register(data) {
    try {
      let users = await User.find();
      if (users.length <= 0) {
        data.roles = [ROLES.ADMIN];
      } else {
        data.roles = [ROLES.USER];
      }
      if (await User.isEmailTaken(data.email)) {
        throw new APIError({ message: "Email already exist", status: 422 });
      }
      const user = new User(data);
      const savedUser = await user.save();
      return savedUser.transform();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {*} user // contains user info for creating registration token
   */
  async createRegistrationToken(user) {
    return `${AuthHeader.encodeUserLoginAuth(
      user.name
    )}xXx${AuthHeader.encodeUserLoginAuth(user.email)}xXx${user.password}`;
  }

  /**
   * FIXME Remove consoles after setting up correct api key
   * @param {*} google_token // Google _id_token for verifying user.
   */

  async checkIfUserExist(data) {
    let user;
    if (data.email) {
      user = await User.findOne({ email: data.email });
    } else {
      user = await User.findOne({ mobile_number: data.mobile_number });
    }
    return !!user;
  }
}
export const AuthService = new Auth();
