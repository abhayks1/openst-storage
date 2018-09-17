'use strict';

//Load external files
require('http').globalAgent.keepAlive = true;
const rootPrefix = '../..';
const AWS = require('aws-sdk');

const basicHelper = require(rootPrefix + '/helpers/basic');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

const instanceMap = {};

const AWSDDBKlass = function() {};

AWSDDBKlass.prototype = {
  getInstance: async function(configStrategy) {
    // check if instance already present
    let instanceKey = basicHelper.getStorageObjectKey(configStrategy),
      _instance = instanceMap[instanceKey];

    if (!_instance) {
      let connectionParams = {
        apiVersion: configStrategy.OS_DYNAMODB_API_VERSION,
        accessKeyId: configStrategy.OS_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: configStrategy.OS_DYNAMODB_SECRET_ACCESS_KEY,
        region: configStrategy.OS_DYNAMODB_REGION,
        endpoint: configStrategy.OS_DYNAMODB_ENDPOINT,
        sslEnabled: configStrategy.OS_DYNAMODB_SSL_ENABLED == 1,
        logger: configStrategy.OS_DYNAMODB_LOGGING_ENABLED == 1 ? console : ''
      };
      _instance = await new AWS.DynamoDB(connectionParams);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

module.exports = new AWSDDBKlass();
