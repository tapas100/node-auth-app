import jwt from 'jsonwebtoken';
import serverConfigs from '../../../config';

const cert = serverConfigs.jwtSecretKey;
class AuthHeaders {
	encodeUserLoginAuth(userId) {
		return jwt.sign({ userId }, cert);
	}

	decodeUserLoginAuth(token) {
		try {
			return jwt.verify(token, cert);
		} catch (error) {
			return error;
		}
	}

	encodeUserPassword(token) {
		return jwt.sign({ password: token }, cert);
	}

	decodeUserPassword(token) {
		return jwt.verify(token, cert);
	}
}
export const AuthHeader =  new AuthHeaders();
