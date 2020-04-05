import { ObjectID } from 'mongodb';
import jwt from 'jsonwebtoken';
import lruCache from 'lru-cache';
import { db , parse} from '../../lib';
import settings from '../../../config';

const cache = lruCache({
	max: 10000,
	maxAge: 1000 * 60 * 60 * 24 // 24h
});

const BLACKLIST_CACHE_KEY = 'blacklist';

class Tokens {
	getTokens(params = {}) {
		const filter = {
			is_revoked: false
		};
		const id = parse.getObjectIDIfValid(params.id);
		if (id) {
			filter._id = new ObjectID(id);
		}

		const email = parse.getString(params.email).toLowerCase();
		if (email && email.length > 0) {
			filter.email = email;
		}

		return db
			.collection('tokens')
			.find(filter)
			.toArray()
			.then(items => items.map(item => this.changeProperties(item)));
	}

	getTokensBlacklist() {
		const blacklistFromCache = cache.get(BLACKLIST_CACHE_KEY);

		if (blacklistFromCache) {
			return Promise.resolve(blacklistFromCache);
		}
		return db
			.collection('tokens')
			.find(
				{
					is_revoked: true
				},
				{ _id: 1 }
			)
			.toArray()
			.then(items => {
				const blacklistFromDB = items.map(item => item._id.toString());
				cache.set(BLACKLIST_CACHE_KEY, blacklistFromDB);
				return blacklistFromDB;
			});
	}

	getSingleToken(id) {
		if (!ObjectID.isValid(id)) {
			return Promise.reject(new Error('Invalid identifier'));
		}
		return this.getTokens({ id }).then(items =>
			items.length > 0 ? items[0] : null
		);
	}

	getSingleTokenByEmail(email) {
		return this.getTokens({ email }).then(items =>
			items.length > 0 ? items[0] : null
		);
	}

	addToken(data) {
		return this.getValidDocumentForInsert(data)
			.then(tokenData => db.collection('tokens').insertMany([tokenData]))
			.then(res => this.getSingleToken(res.ops[0]._id.toString()))
			.then(token =>
				this.getSignedToken(token).then(signedToken => {
					token.token = signedToken;
					return token;
				})
			);
	}

	updateToken(id, data) {
		if (!ObjectID.isValid(id)) {
			return Promise.reject(new Error('Invalid identifier'));
		}
		const tokenObjectID = new ObjectID(id);
		const token = this.getValidDocumentForUpdate(id, data);

		return db
			.collection('tokens')
			.updateOne(
				{
					_id: tokenObjectID
				},
				{ $set: token }
			)
			.then(res => this.getSingleToken(id));
	}

	deleteToken(id) {
		if (!ObjectID.isValid(id)) {
			return Promise.reject(new Error('Invalid identifier'));
		}
		const tokenObjectID = new ObjectID(id);
		return db
			.collection('tokens')
			.updateOne(
				{
					_id: tokenObjectID
				},
				{
					$set: {
						is_revoked: true,
						date_created: new Date()
					}
				}
			)
			.then(res => {
				cache.del(BLACKLIST_CACHE_KEY);
			});
	}

	checkTokenEmailUnique(email) {
		if (email && email.length > 0) {
			return db
				.collection('tokens')
				.count({ email, is_revoked: false })
				.then(count =>
					count === 0
						? email
						: Promise.reject(new Error('Token email must be unique'))
				);
		}
		return Promise.resolve(email);
	}

	getValidDocumentForInsert(data) {
		const email = parse.getString(data.email);
		return this.checkTokenEmailUnique(email).then(email => {
			const token = {
				is_revoked: false,
				date_created: new Date()
			};

			token.name = parse.getString(data.name);
			if (email && email.length > 0) {
				token.email = email.toLowerCase();
			}
			token.scopes = parse.getArrayIfValid(data.scopes);
			token.expiration = parse.getNumberIfPositive(data.expiration);

			return token;
		});
	}

	getValidDocumentForUpdate(id, data) {
		if (Object.keys(data).length === 0) {
			return new Error('Required fields are missing');
		}

		const token = {
			date_updated: new Date()
		};

		if (data.name !== undefined) {
			token.name = parse.getString(data.name);
		}

		if (data.expiration !== undefined) {
			token.expiration = parse.getNumberIfPositive(data.expiration);
		}

		return token;
	}

	changeProperties(item) {
		if (item) {
			item.id = item._id.toString();
			delete item._id;
			delete item.is_revoked;
		}

		return item;
	}

	getSignedToken(token) {
		return new Promise((resolve, reject) => {
			const jwtOptions = {};

			const payload = {
				scopes: token.scopes,
				jti: token.id
			};

			if (token.email && token.email.length > 0) {
				payload.email = token.email.toLowerCase();
			}

			if (token.expiration) {
				// convert hour to sec
				jwtOptions.expiresIn = token.expiration * 60 * 60;
			}

			jwt.sign(payload, settings.jwtSecretKey, jwtOptions, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			});
		});
	}

	getIP(req) {
		let ip = req.get('x-forwarded-for') || req.ip;

		if (ip && ip.includes(', ')) {
			ip = ip.split(', ')[0];
		}

		if (ip && ip.includes('::ffff:')) {
			ip = ip.replace('::ffff:', '');
		}

		if (ip === '::1') {
			ip = 'localhost';
		}

		return ip;
	}
}

export const TokensService = new Tokens();
