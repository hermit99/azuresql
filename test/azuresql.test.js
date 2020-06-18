/**
 * Test azuresql lib
 * Mingyu He 2020-06-18
 */
/* eslint-env jest */ // stop eslint complaints

require('dotenv').config()
const { sql, sqlQuery, closePool } = require('../index')
const { tableTest, tableConvo } = process.env

beforeAll(() => jest.setTimeout(30000))
afterAll(() => closePool())

test('Select', async () => {
  const r = await sqlQuery('select top 2 * from ' + tableConvo)
  expect(r.recordset.length).toEqual(2)
})

test('Insert', async () => {
  const id = Math.round(Math.random() * 1000)
  const amount = Math.random() * 1000000
  let r = await sqlQuery(`insert into ${tableTest} (id, name, orderDate, amount, note) values (@id, @name, @orderDate, @amount, @note)`,
    { k: 'id', v: id }, { k: 'name', v: 'some name -' + Math.floor(Math.random() * 100) }, { k: 'note', v: id > 400 ? null : 'some random notes here' },
    { k: 'orderDate', v: new Date(Date.now() - Math.floor(Math.random() * 100000000000)) }, { k: 'amount', type: sql.Money, v: amount })
  expect(r.rowsAffected[0]).toBe(1)
  r = await sqlQuery(`select * from ${tableTest} where id = @id`, { k: 'id', v: id })
  expect(r.recordset.length).toBe(1)
  expect(r.recordset[0].id).toEqual(id)
})

test('Selects', async () => {
  let r = await sqlQuery(`select top 1 id from ${tableTest} where id <> @id; select top 1 Q from ${tableConvo} where sessionId = @sessionId`, ...[{ k: 'id', v: 1 }, { k: 'sessionId', v: '4zqX3KceAxmlGBrEIXnbj' }])
  console.log('result:', JSON.stringify(r, null, 2))
  expect(r.recordsets.length).toBe(2)
  r = await sqlQuery(`select top 1 id from ${tableTest}; select top 1 Q from ${tableConvo} where sessionId = @sessionId`, { k: 'sessionId', v: 'not valid value' })
  expect(r.recordsets.length).toBe(2)
  expect(r.recordsets[1].length).toBe(0)
})

test('Delete', async () => {
  let r = await sqlQuery('delete from ' + tableTest)
  expect(r.rowsAffected[0]).toBeGreaterThanOrEqual(1)
  r = await sqlQuery('select * from ' + tableTest)
  expect(r.recordset.length).toBe(0)
})
