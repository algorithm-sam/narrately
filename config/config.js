
require('dotenv').config({ path: require('path').join(__dirname, '../.env')})

function config(data) {
  return {
    "test": {
      "username": data["DB_USERNAME_TEST"],
      "password": data["DB_PASSWORD_TEST"],
      "database": data["DB_NAME_TEST"],
      "host": data["DB_URL_TEST"],
      "dialect": data["DB_DIALET_DEV"],
    },
    "production": {
      "username": data["DB_USERNAME_PRODUCTION"],
      "password": data["DB_PASSWORD_PRODUCTION"],
      "database": data["DB_NAME_PRODUCTION"],
      "host": data["DB_URL_PRODUCTION"],
      "dialect":data["DB_DIALET_PRODUCTION"]
    },
    "development": {
      "username": data["DB_USERNAME_DEV"],
      "password": data["DB_PASSWORD_DEV"],
      "database": data["DB_NAME_DEV"],
      "host": data["DB_URL_DEV"],
      "dialect": data["DB_DIALET_TEST"]
    }
  };
}

module.exports = config(process.env);