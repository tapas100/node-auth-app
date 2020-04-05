import { UserService } from "../services";
import { security } from "../lib/security";
import { response } from '../lib/handleResponse';
class UserRoutes {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get(
      "/v1/users",
      security.auth.bind(this),
      this.getUsers.bind(this)
    );
  }



  async getUsers(req, res, next) {
    try {
        console.log('here #1');
      const result = await UserService.getUsers();
      response.success(res, result);
    } catch (error) {
      response.error(res, error);
    }
  }
}


export {
  UserRoutes
}
