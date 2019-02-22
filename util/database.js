const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "node-complete",
  password: "zhaojing123"
});

module.exports = pool.promise(); //fetch db is async action
