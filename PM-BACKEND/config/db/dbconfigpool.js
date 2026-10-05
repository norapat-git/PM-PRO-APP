
var oracledb = require("oracledb");
require('dotenv').config();

/*
const host = (`${process.env.NODE_ENV}` === "dev") ? `${process.env.HOST2}` : `${process.env.HOST}`;//private field
const user = (`${process.env.NODE_ENV}` === "dev") ? `${process.env.USER2}` : `${process.env.USER}`;//private field
const pass = (`${process.env.NODE_ENV}` === "dev") ? `${process.env.PASS2}` : `${process.env.PASS}`;//private field
*/
/*module.exports = {
    user          : process.env.NODE_ORACLEDB_USER,
    password      : process.env.NODE_ORACLEDB_PASSWORD,
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    connectionLimit: 10,
    timezone: 'gmt+7'
};*/

//  Legacy Oracle Database configuration (Guarded)
let pool = null;
if (process.env.NODE_ORACLEDB_USER && process.env.NODE_ORACLEDB_CONNECTIONSTRING) {
  try {
    pool = oracledb.createPool({
      user: process.env.NODE_ORACLEDB_USER,
      password: process.env.NODE_ORACLEDB_PASSWORD,
      connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING, 
      poolAlias: process.env.NODE_ORACLEDB_POOLALIAS,
      poolMax: 200,
      queueMax: 500,
      timezone: 'gmt+7'
    });
  } catch (err) {
    console.warn('[Oracle Legacy] Pool init skipped:', err.message);
  }
} else {
  // Oracle credentials not provided - running on Supabase
}

module.exports = pool;
