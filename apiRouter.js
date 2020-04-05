/* eslint-disable no-new */
import express from 'express';
import { AuthRoutes , UserRoutes} from './src/routes';
const apiRouter = express.Router();

new AuthRoutes(apiRouter);
new UserRoutes(apiRouter);



export default apiRouter;
