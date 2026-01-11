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

  const fs = require('fs');
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
      'listLeagues': { scenario: 'defaultScenario' },
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
      'listTeams': { scenario: 'fourTeams' },
      'getLeagueTeamAssignments': { scenario: 'allAiControlled' },
    },

    // Commissioner view: Many pending invitations sent
    'many-pending': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'listTeams': { scenario: 'fourTeams' },
      'getLeagueTeamAssignments': { scenario: 'manyPending' },
    },

    // Full league: All teams have active GMs
    'all-active': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'defaultScenario' },
      'listTeams': { scenario: 'fourTeams' },
      'getLeagueTeamAssignments': { scenario: 'allActive' },
    },

    // New user: No teams or leagues assigned yet
    'new-user': {
      'getCurrentUser': { scenario: 'defaultScenario' },
      'getMyTeams': { scenario: 'empty' },
      'listLeagues': { scenario: 'empty' },
      'getLeagueTeamAssignments': { scenario: 'defaultScenario' },
    },

    // ==========================================
    // Dashboard User State Presets
    // ==========================================

    // User (not commissioner) with first team assigned (new, hasn't taken control)
    'user-first-team': {
      'getMyTeams': { scenario: 'oneTeamNew' },
      'listLeagues': { scenario: 'empty' },
    },

    // User (not commissioner) with multiple teams, one new
    'user-multiple-teams-one-new': {
      'getMyTeams': { scenario: 'multipleTeamsOneNew' },
      'listLeagues': { scenario: 'empty' },
    },

    // Commissioner of 1 league, no teams as GM
    'commissioner-no-teams': {
      'getMyTeams': { scenario: 'empty' },
      'listLeagues': { scenario: 'defaultScenario' },
    },

    // Commissioner of 1 league, first team assigned (new)
    'commissioner-first-team': {
      'getMyTeams': { scenario: 'oneTeamNew' },
      'listLeagues': { scenario: 'defaultScenario' },
    },

    // Commissioner of 1 league, multiple teams, one new
    'commissioner-multiple-teams-one-new': {
      'getMyTeams': { scenario: 'multipleTeamsOneNew' },
      'listLeagues': { scenario: 'defaultScenario' },
    },

    // Error testing: API errors
    'error-mode': {
      'getMyTeams': { scope: 'error' },
      'listLeagues': { scope: 'error' },
      'listTeams': { scope: 'error' },
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

  // Track active preset
  let activePreset = null;

  // Custom reset endpoint - must be before mock routes
  app.post('/_reset', (req, res) => {
    resetState();
    activePreset = null;
    // Also reset all route scenarios back to default
    mockRoutes.forEach(route => {
      route.testScenario = 'defaultScenario';
      route.testScope = 'success';
      route.latency = undefined;
    });
    // Clear the store.json cache to ensure fresh responses
    try {
      fs.writeFileSync(storeJsonFilePath, '{}');
    } catch (err) {
      console.warn('Could not clear store.json:', err);
    }
    res.json({ success: true, message: 'Mock server state reset' });
  });

  // Change scenario for a specific route
  app.post('/_scenario', (req, res) => {
    const { route: routeName, scenario, scope } = req.body;

    if (!routeName) {
      return res.status(400).json({
        success: false,
        error: 'Route name is required',
      });
    }

    const route = mockRoutes.find(r => r.name === routeName);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: `Route '${routeName}' not found`,
        available: mockRoutes.map(r => r.name),
      });
    }

    if (scenario !== undefined) {
      route.testScenario = scenario;
    }
    if (scope !== undefined) {
      route.testScope = scope;
    }

    res.json({
      success: true,
      route: routeName,
      scenario: route.testScenario,
      scope: route.testScope,
    });
  });

  // Get available presets
  app.get('/_preset', (req, res) => {
    res.json({
      active: activePreset,
      available: Object.keys(presets),
    });
  });

  // Activate a preset
  app.post('/_preset', (req, res) => {
    const { name } = req.body;

    // Reset to default if null or 'default'
    if (name === null || name === 'default') {
      mockRoutes.forEach(route => {
        route.testScenario = 'defaultScenario';
        route.testScope = 'success';
        route.latency = undefined;
      });
      activePreset = null;
      return res.json({
        success: true,
        preset: null,
        message: 'Reset to default configuration',
        routesUpdated: mockRoutes.length,
      });
    }

    // Check if preset exists
    if (!presets[name]) {
      return res.status(404).json({
        success: false,
        error: `Preset '${name}' not found`,
        available: Object.keys(presets),
      });
    }

    const preset = presets[name];
    let routesUpdated = 0;

    // Apply preset configuration to routes
    mockRoutes.forEach(route => {
      // Check for exact match
      let config = preset[route.name];

      // Check for wildcard
      if (!config && preset['*']) {
        config = preset['*'];
      }

      // Check for prefix match (e.g., 'get*')
      if (!config) {
        for (const pattern of Object.keys(preset)) {
          if (pattern.endsWith('*') && route.name.startsWith(pattern.slice(0, -1))) {
            config = preset[pattern];
            break;
          }
        }
      }

      if (config) {
        if (config.scenario !== undefined) {
          route.testScenario = config.scenario;
        }
        if (config.scope !== undefined) {
          route.testScope = config.scope;
        }
        if (config.latency !== undefined) {
          route.latency = config.latency;
        }
        routesUpdated++;
      }
    });

    activePreset = name;
    res.json({
      success: true,
      preset: name,
      message: `Preset '${name}' activated`,
      routesUpdated,
    });
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
