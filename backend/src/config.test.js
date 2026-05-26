const test = require('node:test');
const assert = require('node:assert/strict');

const { getCorsOrigin } = require('./config');

test('getCorsOrigin allows reflected origins when unset', () => {
  assert.equal(getCorsOrigin(undefined), true);
  assert.equal(getCorsOrigin(''), true);
});

test('getCorsOrigin parses comma-separated origins', () => {
  assert.deepEqual(
    getCorsOrigin('http://10.255.255.173, http://localhost:5173'),
    ['http://10.255.255.173', 'http://localhost:5173']
  );
});
