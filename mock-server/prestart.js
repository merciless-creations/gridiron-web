/**
 * Pre-start task - clears the store.json before server starts
 * This ensures each server start has a clean slate
 */
const fs = require('fs');
const storeJsonFilePath = require('./common/store-json-file-path');

const preStartTask = () => new Promise((resolve) => {
  console.log('Attempting to clear store.json =>>> ', storeJsonFilePath);
  fs.exists(storeJsonFilePath, function (exists) {
    if (exists) {
      console.log('File exists. clearing now ...');
      fs.writeFile(storeJsonFilePath, '{}', function (err) {
        if (err) {
          console.log('Unable to clear store.json ', err);
        }
        console.log('The store.json was cleared!');
        resolve();
      });
    } else {
      console.log('Store.json not found, no need to clear.');
      resolve();
    }
  });
});

module.exports = preStartTask;
