A tiny Azure SQL database Node.js client utility to help you focus on just writing your SQL query.

# Installation
>npm install azuresql

# Usage
    const { sqlQuery, closePool } = require('azureSql')
    try {
      var result = await sqlQuery('select * from tableName where id = @id', { k: 'id', v: 1 })
      ...
    } catch (e) {
      ...
    }

Only call `closePool()` at the end of application where no further queries to the database are to be performed.

# Configuration
The following environment variables need to be set up:
- sqlUser

  Azure SQL database user
- sqlPass

  Azure SQL database password
- sqlServer

  Azure SQL database server name in a format like: <dbname>.database.windows.net
- sqlDb

  Azure SQL database name
- sqlPoolMax

  Connection pool maximum connections. Default 1
- sqlPoolMin

  Connection pool minimum connections. Default 0
- sqlPoolIdleTimeout

  Connection pool idle timeout in miliseconds. Default 30000 (30 seconds)

Also make sure your Azure SQL's firewall allows the IPs that are trying to connect.

# Examples
## Multiple queries in one go
    var r = await sqlQuery(`SELECT userId FROM ${tableUser} WHERE id = @id; SELECT beginTime FROM ${tableSession} WHERE session = @session`,
      { k: 'id', v: data.userId }, { k: 'session', v: data.sessionNo })
    r.recordsets[0] ... // first query results
    r.recordsets[1] ... // second query results

## Insert and SQL Data Types
    const { sql, sqlQuery } = require('azuresql')
    var r = await sqlQuery(`insert into ${tableName} (id, notes, amount) vaules(@id, @comment, @money)`,
      { k: 'id', v: 3 }, { k: 'comment', v: 'blah...', type: sql.VarChar(sql.MAX) }, { k: 'money', v: 9876543210.1234, type: sql.Money })
Check more [SQL data types](https://www.npmjs.com/package/mssql#data-types).

## An upsert example
A slightly complex example using T-SQL's upsert/merge syntax. The code is succinct as the data object has the same property names as the table comlumns.

    const columns = ['orderNo', 'details', 'quantity'] // table columns
    const sql =
      `merge ${tableName} target
      using (values (@orderNo)) as src (orderNo)
      on target.orderNo = src.orderNo
      when matched then
        update set ${columns.slice(1).map(r => 'target.' + r + '=@' + r).join()}
      when not matched by target then
        insert (${columns.join()})
        values (@${columns.join(',@')})`

    // When the data object has the same property names as the table columns, the prepared statement will be easy:
    var params = columns.map(r => ({ k: r, v: data[r] }))
    var result = await sqlQuery(sql, ...params)

# Enable debug info
Set the DEBUG envrionment variable to `azuresql`.

On Windows CMD:
>set DEBUG=azuresql & node app.js

PowerShell (VS Code default)
>$env:DEBUG='azuresql'; node app.js

# Functions

## sqlQuery(sql, ...params) ⇒ <code>object</code>
Query Azure SQL database

**Kind**: global function
**Returns**: <code>object</code> - an object like: { recordsets: [[{...}]], recordset:[{...}], output: {}, rowsAffected: [] }

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | T-SQL |
| ...params | <code>object</code> | rest parameters |
| param.k | <code>string</code> | key for prepared statements |
| param.v | <code>string</code> | value for prepared statements |
| [param.type] | <code>object</code> | [SQL data types](https://www.npmjs.com/package/mssql#data-types), optional in normal cases |

<a name="closePool"></a>

## closePool()
NOTE: Should only be called at the end of application!

**Kind**: global function

## getRequest() ⇒ <code>object</code>
NOTE: Only when you need to extend and play with other features in mssql package

**Kind**: global function
**Returns**: <code>object</code> - Request object
<a name="sqlQuery"></a>
