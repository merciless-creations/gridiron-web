/**
 * Routes index
 * Automatically loads all mock routes from subdirectories
 */
const fs = require('fs');
const path = require('path');

/**
 * Load all mocks from route files in subdirectories
 * Each subdirectory should have an index.js that exports { mocks: [] }
 */
function loadAllRoutes() {
  const allMocks = [];
  const routesDir = __dirname;

  // Get all subdirectories
  const entries = fs.readdirSync(routesDir, { withFileTypes: true });
  const directories = entries.filter(entry => entry.isDirectory());

  for (const dir of directories) {
    const indexPath = path.join(routesDir, dir.name, 'index.js');
    if (fs.existsSync(indexPath)) {
      try {
        const routeModule = require(indexPath);
        if (routeModule.mocks && Array.isArray(routeModule.mocks)) {
          allMocks.push(...routeModule.mocks);
          console.log(`Loaded ${routeModule.mocks.length} routes from ${dir.name}/`);
        }
      } catch (err) {
        console.error(`Error loading routes from ${dir.name}:`, err.message);
      }
    }
  }

  return allMocks;
}

module.exports = {
  loadAllRoutes,
};
