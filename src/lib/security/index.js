import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import settings from "../../../config";
import { TokensService } from "../../services";
import { User } from "../../models";
import { ROLES } from "../roles";
const DEVELOPER_MODE = settings.developerMode === true;
const SET_TOKEN_AS_REVOKEN_ON_EXCEPTION = true;

const PATHS_WITH_OPEN_ACCESS = [
  "/api/v1/authorize",
  /\/api\/v1\/notifications/i,
  /\/ajax\//i
];

const checkUserScope = (requiredScope, req, res, next) => {
  if (DEVELOPER_MODE === true) {
    next();
  } else if (
    req.user &&
    req.user.scopes &&
    req.user.scopes.length > 0 &&
    (req.user.scopes.includes(ROLES.ADMIN) ||
      req.user.scopes.includes(requiredScope))
  ) {
    next();
  } else {
    res.status(403).send({ error: true, message: "Forbidden" });
  }
};

const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, settings.jwtSecretKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        // check on blacklist
        resolve(decoded);
      }
    });
  });

const isAdmin = (req, res, next) => {
  let token = req.headers.authorization;
  verifyToken(token)
    .then(async user => {
      let userObj = await User.findOne({ _id: user._id });
      userObj = userObj.roles.find(el => el === ROLES.ADMIN);
      if (userObj) {
        req.user = user;
        next();
      } else {
        res.status(401).send({ error: true, message: "Unauthorized as Admin" });
      }
    })
    .catch(error => {
      res.status(401).send({ error: true, message: "Unauthorized" });
    });
};

function getToken(req) {
  let token;
  token = req.headers.authorization;
  if (!token) {
    token = req.query.authorization;
  }
  return token;
}

const auth = (req, res, next) => {
  let token = getToken(req);
  console.log("token", token);
  verifyToken(token)
    .then(user => {
      User.findOne({ _id: user._id }).then(
        // eslint-disable-next-line no-shadow
        user => {
          if (user) {
            req.user = user;
            next();
          } else {
            res
              .status(404)
              .send({ error: true, message: "user does not exist" });
          }
        },
        _error => {
          res.status(401).send({ error: true, message: "Unauthorized" });
        }
      );
    })
    .catch(error => {
      res.status(401).send({ error: true, message: "Unauthorized" });
    });
};

const userIfPresent = (req, res, next) => {
  let token = req.headers.authorization;
  verifyToken(token)
    .then(user => {
      User.findOne({ _id: user._id }).then(
        // eslint-disable-next-line no-shadow
        user => {
          // console.log('inside auth', user.transform());
          // console.log('user', user);
          req.user = user;
          next();
        },
        _error => {
          next();
          // res.status(401).send({ error: true, message: 'Unauthorized' });
        }
      );
    })
    .catch(error => {
      next();
    });
};

// eslint-disable-next-line consistent-return
const checkTokenInBlacklistCallback = async (req, payload, done) => {
  try {
    const { jti } = payload;
    const blacklist = await TokensService.getTokensBlacklist();
    const tokenIsRevoked = blacklist.includes(jti);
    return done(null, tokenIsRevoked);
  } catch (e) {
    done(e, SET_TOKEN_AS_REVOKEN_ON_EXCEPTION);
  }
};

const applyMiddleware = app => {
  if (DEVELOPER_MODE === false) {
    app.use(
      expressJwt({
        secret: settings.jwtSecretKey,
        isRevoked: checkTokenInBlacklistCallback
      }).unless({ path: PATHS_WITH_OPEN_ACCESS })
    );
  }
};

const getAccessControlAllowOrigin = () =>
  [settings.storeBaseUrl, settings.adminBaseURL] || "*";

export const security = {
  checkUserScope,
  verifyToken,
  applyMiddleware,
  getAccessControlAllowOrigin,
  DEVELOPER_MODE,
  auth,
  isAdmin,
  userIfPresent
};
