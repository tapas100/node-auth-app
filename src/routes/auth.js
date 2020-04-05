import { AuthService } from "../services";
import { security } from "../lib/security";
import  { userValidations }  from "../validations";
import { response } from '../lib/handleResponse';
class AuthRoutes {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post(
      "/v1/auth/login",
      userValidations.loginValidate.bind(this),
      this.login.bind(this)
    );
    this.router.post("/v1/auth/register", this.register.bind(this));
  }



  async login(req, res, next) {
    try {
      const loginResponse = await AuthService.login(req.body);
      response.success(res, loginResponse);
    } catch (error) {
      response.error(res, error);
    }
  }

  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      response.success(res, { user });
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  }
}


export {
  AuthRoutes
}
