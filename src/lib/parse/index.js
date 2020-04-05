import { ObjectID } from "mongodb";

const getString = value => (value || "").toString();

const getDateIfValid = value => {
  const date = Date.parse(value);
  return isNaN(date) ? null : new Date(date);
};

const getArrayIfValid = value => (Array.isArray(value) ? value : null);

const getObjectIDIfValid = value =>
  ObjectID.isValid(value) ? new ObjectID(value) : null;

const getArrayOfObjectID = value => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(id => getObjectIDIfValid(id)).filter(id => !!id);
  }
  return [];
};

const isNumber = value => !isNaN(parseFloat(value)) && isFinite(value);

const getNumberIfValid = value => (isNumber(value) ? parseFloat(value) : null);

const getNumberIfPositive = value => {
  const n = getNumberIfValid(value);
  return n && n >= 0 ? n : null;
};

const getBooleanIfValid = (value, defaultValue = null) => {
  if (value === "true" || value === "false") {
    return value === "true";
  }
  return typeof value === "boolean" ? value : defaultValue;
};

const getBrowser = browser =>
  browser
    ? {
        ip: getString(browser.ip),
        user_agent: getString(browser.user_agent)
      }
    : {
        ip: "",
        user_agent: ""
      };

export const parse = {
  getString,
  getObjectIDIfValid,
  getDateIfValid,
  getArrayIfValid,
  getArrayOfObjectID,
  getNumberIfValid,
  getNumberIfPositive,
  getBooleanIfValid,
  getBrowser
};
