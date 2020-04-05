import winston from "winston";
import url from "url";
import { MongoClient } from "mongodb";
import settings from "./lib/settings";

const mongodbConnection = settings.mongodbServerUrl;
const mongoPathName = url.parse(mongodbConnection).pathname;
const dbName = mongoPathName.substring(mongoPathName.lastIndexOf("/") + 1);

const CONNECT_OPTIONS = {
  useNewUrlParser: true
};

(async () => {
  let client = null;
  let db = null;

  try {
    client = await MongoClient.connect(mongodbConnection, CONNECT_OPTIONS);
    db = client.db(dbName);
    winston.info(`Successfully connected to ${mongodbConnection}`);
  } catch (e) {
    winston.error(`MongoDB connection was failed. ${e.message}`);

    return;
  }
  client.close();
})();
