const path = require('path')

// Loads server/.env normally, or server/.env.test when running the test
// suite (NODE_ENV=test) — a completely separate DATABASE_URL, so tests can
// never touch real data no matter what.
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
require('dotenv').config({ path: path.resolve(__dirname, '..', envFile) })

// import the Sequelize constructor from the library
const Sequelize = require('sequelize')

const isTest = process.env.NODE_ENV === 'test'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    // Local/CI test databases don't have SSL configured; Heroku Postgres requires it.
    ...(isTest ? {} : {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }),
    logging: isTest ? false : console.log,
  }
);

if (!isTest) {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
}

module.exports = sequelize
