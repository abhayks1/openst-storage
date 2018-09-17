'use strict';

//Load external files
require('http').globalAgent.keepAlive = true;
const rootPrefix = '../..',
  AWSDaxClient = require('amazon-dax-client');

const basicHelper = require(rootPrefix + '/helpers/basic');

const instanceMap = {};

const AWSDaxClientKlass = function() {};

AWSDaxClientKlass.prototype = {
  getInstance: async function(configStrategy) {
    // check if instance already present
    let instanceKey = basicHelper.getStorageObjectKey(configStrategy),
      _instance = instanceMap[instanceKey];

    if (!_instance) {
      let connectionParams = {
        apiVersion: configStrategy.OS_DAX_API_VERSION,
        accessKeyId: configStrategy.OS_DAX_ACCESS_KEY_ID,
        secretAccessKey: configStrategy.OS_DAX_SECRET_ACCESS_KEY,
        region: configStrategy.OS_DAX_REGION,
        endpoint: configStrategy.OS_DAX_ENDPOINT,
        sslEnabled: configStrategy.OS_DAX_SSL_ENABLED == 1,
        logger: configStrategy.OS_DYNAMODB_LOGGING_ENABLED == 1 ? console : ''
      };
      _instance = await new AWSDaxClient(connectionParams);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

module.exports = new AWSDaxClientKlass();
