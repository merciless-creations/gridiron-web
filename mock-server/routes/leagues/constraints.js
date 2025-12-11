/**
 * League constraints route
 * GET /api/leagues-management/constraints
 */
const { LEAGUE_CONSTRAINTS } = require('../../state');

const mocks = [];

const getConstraints = {
  name: 'getConstraints',
  mockRoute: '/api/leagues-management/constraints',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(LEAGUE_CONSTRAINTS);
      },
    },
  ],
};

mocks.push(getConstraints);

exports.mocks = mocks;
