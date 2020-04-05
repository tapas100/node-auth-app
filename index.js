import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import responseTime from 'response-time';
import winston from 'winston';
import apiRouter from './apiRouter';
import { security ,logger } from './src/lib';
import settings from "./config";
const cors = require('cors');
const app = express();

const STATIC_OPTIONS = {
	maxAge: 31536000000 // One year
};
app.use(cors());
app.set('trust proxy', 1);
app.use(helmet());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/images/:entity/:id/:size/:filename', (req, res, next) => {
	// A stub of image resizing (can be done with Nginx)
	const newUrl = `/images/${req.params.entity}/${req.params.id}/${req.params.filename}`;
	req.url = newUrl;
	next();
});
app.use(express.static('public', STATIC_OPTIONS));
security.applyMiddleware(app);
app.use(responseTime());
app.use(cookieParser(settings.cookieSecretKey));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(logger.sendResponse);

const server = app.listen(settings.apiListenPort, () => {
	const serverAddress = server.address();
	winston.info(`API running at http://localhost:${serverAddress.port}`);
});

