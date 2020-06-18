/**
 * Azure SQL client
 *
 * Mingyu He 2020-06-18
 */
const { sqlUser, sqlPass, sqlServer, sqlDb, sqlPoolMax, sqlPoolMin, sqlPoolIdleTimeout } = process.env
const log = require('debug')('azuresql')

const sql = require('mssql')
var sqlConfig = {
  user: sqlUser,
  password: sqlPass,
  server: sqlServer,
  database: sqlDb,
  pool: {
    max: +sqlPoolMax || 1,
    min: +sqlPoolMin || 0,
    idleTimeoutMillis: +sqlPoolIdleTimeout || 30000
  },
  options: {
    encrypt: true,
    enableArithAbort: true
  }
}
var pool

/**
 * Get a Request object from a connection pool that is lazy-initiated
 * NOTE: Only when you need to extend and play with other features in mssql package
 * @returns {object} Request object
 */
async function getRequest () {
  if (!pool) {
    pool = new sql.ConnectionPool(sqlConfig)
    await pool.connect()
  }
  return new sql.Request(pool)
}

/**
 * Query Azure SQL database
 * @param {string} sql - T-SQL
 * @param {object} params - rest parameters
 * @param {string} param.k - key for prepared statements
 * @param {string} param.v - value for prepared statements
 * @param {object} [param.type] - {@link https://www.npmjs.com/package/mssql#data-types|SQL data types}, optional in normal cases
 * @returns {object} an object like: { recordsets: [[{...}]], recordset:[{...}], output: {}, rowsAffected: [] }
 */
async function sqlQuery (sql, ...params) {
  var request = await getRequest()
  for (var param of params) {
    param.type ? request.input(param.k, param.type, param.v) : request.input(param.k, param.v)
  }
  log('SQL:', sql, 'Params:', params)
  var result = await request.query(sql)
  log('==> %j', result)
  return result
}

/**
 * Close the connection pool
 * NOTE: Should only be called at the end of application!
 */
function closePool () {
  pool && pool.close()
  pool = null
}

module.exports = {
  sql,
  sqlQuery,
  getRequest,
  closePool
}
