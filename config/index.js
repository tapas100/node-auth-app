// config used by server side only
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || 'nodeApp';
const dbUser = process.env.DB_USER || '';
const dbPass = process.env.DB_PASS || '';
const dbCred =
	dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : '';

const dbUrl =
	process.env.DB_URL || `mongodb://${dbCred}${dbHost}:${dbPort}/${dbName}`;

module.exports = {
	// used by Store (server side)
	apiBaseUrl: process.env.API_BASE_URL || `http://localhost:3002/api/v1`,

	// Access-Control-Allow-Origin

	apiListenPort: process.env.API_PORT || 3002,

	// used by API
	mongodbServerUrl: dbUrl,
	// smpt server parameters
	// key to sign tokens
	jwtSecretKey: process.env.JWT_SECRET_KEY || '-',

	// key to sign store cookies
	cookieSecretKey: process.env.COOKIE_SECRET_KEY || '-',

	// store UI language
	language: process.env.LANGUAGE || 'ru',

	// used by API

	// cost factor, controls how much time is needed to calculate a single BCrypt hash
	// for production: recommended salRounds > 12

	developerMode: process.env.DEVELOPER_MODE || true
};

