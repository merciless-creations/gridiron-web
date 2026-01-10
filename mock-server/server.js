/**
 * Gridiron Mock API Server
 *
 * A mock REST API server for Gridiron development and testing.
 * Routes are loaded from the routes/ directory.
 */
const preStart = require('./prestart');

const port = process.env.PORT || 3001;
console.log(`listen: ${port}`);

preStart().then(() => {
  const mock = require('mock-json-api');
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');

  const { loadAllRoutes } = require('./routes');
  const { resetState } = require('./state');
  const storeJsonFilePath = require('./common/store-json-file-path');

  // Load all routes from files
  console.log('Loading mock routes...');
  const mockRoutes = loadAllRoutes();
  console.log(`Total routes loaded: ${mockRoutes.length}`);

  // Define presets for Epic #49 (GM Invitation & Onboarding) testing
  const presets = {
    // Default: Mixed control states - good for general testing
    'default': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'getLeagueTeamAssignments': { scenario: 'defaultScenario' },
    },

    // New GM who just received an invitation and is logging in for first time
    'new-gm-pending': {
      'getCurrentUser': { scenario: 'pendingUserScenario' },
      'getMyTeams': { scenario: 'pendingUserScenario' },
      'getLeagueTeamAssignments': { scenario: 'defaultScenario' },
    },

    // Commissioner view: Fresh league with all teams AI controlled
    'fresh-league': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'getLeagueTeamAssignments': { scenario: 'allAiControlled' },
    },

    // Commissioner view: Many pending invitations sent
    'many-pending': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'getLeagueTeamAssignments': { scenario: 'manyPending' },
    },

    // Full league: All teams have active GMs
    'all-active': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'getLeagueTeamAssignments': { scenario: 'allActive' },
    },

    // New user: No teams assigned yet
    'new-user': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'empty' },
      'getLeagueTeamAssignments': { scenario: 'defaultScenario' },
    },

    // Error testing: API errors
    'error-mode': {
      'getMyTeams': { scope: 'error' },
      'getLeagueTeamAssignments': { scope: 'error' },
      'assignGm': { scope: 'error' },
    },

    // Slow network simulation
    'slow-network': {
      '*': { latency: 2000 },
    },
  };

  // Create mock API with json store for caching and presets
  const mockApi = mock({
    mockRoutes,
    jsonStore: storeJsonFilePath,
    presets,
  });

  // Create Express app manually for more control
  const app = express();

  // Enable CORS and body parsing
  app.use(cors());
  app.use(bodyParser.json());

  // Disable caching for all responses
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  // Custom reset endpoint - must be before mock routes
  app.post('/_reset', (req, res) => {
    resetState();
    // Also reset all route scenarios back to default
    mockRoutes.forEach(route => {
      route.testScenario = 'defaultScenario';
      route.testScope = 'success';
    });
    res.json({ success: true, message: 'Mock server state reset' });
  });

  // Graceful shutdown endpoint
  app.get('/stop', (req, res) => {
    console.log('Received shutdown signal');
    res.status(200).send('Shutting down...');
    process.exit(0);
  });

  // Mount mock-json-api routes
  const mockServer = mockApi.createServer();
  app.use(mockServer);

  // Start server
  app.listen(port, () => {
    console.log(`Gridiron Mock API Server running on http://localhost:${port}`);
    console.log('MockServer instance is running');
    console.log('Available endpoints:');
    console.log('  POST /_reset - Reset all state');
    console.log('  POST /_scenario - Change route scenario');
    console.log('  GET  /_preset - List available presets');
    console.log('  POST /_preset - Activate a preset');
    console.log('  GET  /stop - Graceful shutdown');

    console.log('\nAvailable presets (POST /_preset with {"name": "preset-name"}):');
    Object.keys(presets).forEach(name => {
      const routes = Object.keys(presets[name]).join(', ');
      console.log(`  ${name}: ${routes}`);
    });

    // List routes grouped by domain
    const routesByDomain = {};
    mockRoutes.forEach(route => {
      const parts = route.mockRoute.replace(/^\^?/, '').split('/').filter(Boolean);
      const domain = parts[1] || 'other';
      if (!routesByDomain[domain]) {
        routesByDomain[domain] = [];
      }
      routesByDomain[domain].push(route);
    });

    Object.keys(routesByDomain).sort().forEach(domain => {
      console.log(`\n  [${domain}]`);
      routesByDomain[domain].forEach(route => {
        const method = (route.method || 'GET').toUpperCase().padEnd(6);
        // Clean up regex patterns for display
        const displayRoute = route.mockRoute
          .replace(/^\^/, '')
          .replace(/\$$/, '')
          .replace(/\(\[0-9\]\+\)/g, ':id');
        console.log(`    ${method} ${displayRoute}`);
      });
    });
  });
});
