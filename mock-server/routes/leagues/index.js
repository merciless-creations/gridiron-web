/**
 * League routes index
 * Aggregates all league-related mocks
 */
const constraints = require('./constraints');
const crud = require('./crud');
const structure = require('./structure');
const season = require('./season');

const mocks = [
  ...constraints.mocks,
  ...crud.mocks,
  ...structure.mocks,
  ...season.mocks,
];

exports.mocks = mocks;
