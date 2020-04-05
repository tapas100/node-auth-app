import { ObjectID } from "mongodb";
import {User} from "../../models";
import { AuthHeader, ROLES, msg , APIError } from "../../lib";
const HttpStatus = require("http-status-codes");
const https = require("https");

class UserServices {
  /**
   * * It'll give you authentication token.
   * @param {*} data //contains credential as email and password
   */
   async getUsers(){
       try {
           console.log('here 1');
           let result = await User.find();
           console.log('result',result);
           return result;
       } catch (error) {
           throw error;
       }
   }
  
}
export const UserService = new UserServices()
