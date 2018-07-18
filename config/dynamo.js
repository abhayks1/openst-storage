"use strict";

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk')
  , AWSDaxClient = require('amazon-dax-client');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

/**
 * Constructor for DynamoDB Config
 *
 * @constructor
 */
const dynamoConfig = function() {
};

dynamoConfig.prototype = {

  /**
   * Type Raw
   *
   * @constant {string}
   *
   */
  raw: 'raw'
  ,

  /**
   * Type DocumentClient
   *
   * @constant {string}
   *
   */
  documentClient: 'documentClient'
  ,

  /**
   * Type isDaxEnabled
   *
   * @constant {boolean}
   */
  isDaxEnabled: false
  ,

  /**
   * Get provider
   *
   * @param connectionStrategies: connectionParams of client
   * @param serviceType: type of service, either raw or docClient
   * @returns DynamoDB connection object
   *
   */
  getProvider: async function (connectionStrategies, serviceType) {
    const oThis = this;
    oThis.connectionParams = oThis.getConfig(connectionStrategies, serviceType);
    if (serviceType === oThis.raw) {
      return await oThis.createRawObject();
    }
    else if (serviceType === oThis.documentClient) {
      return oThis.createDocumentClientObject();
    }
    return null;
  },

  createRawObject: async function () {
    const oThis = this;
    oThis.dynamoDBObject = await new AWS.DynamoDB(oThis.connectionParams);
    return oThis.dynamoDBObject;
  },

  createDocumentClientObject: function () {
    const oThis = this;
    if (oThis.isDaxEnabled) {
      oThis.dax = new AWSDaxClient(oThis.connectionParams);
      oThis.daxDocumentClientObject = new AWS.DynamoDB.DocumentClient({'service': oThis.dax});
      return oThis.daxDocumentClientObject;
    }
    else {
      oThis.documentClientObject = new AWS.DynamoDB.DocumentClient(oThis.connectionParams);
      return oThis.documentClientObject;
    }
  },

  getConfig: function (connectionStrategies, serviceType) {
    const oThis = this;
    let connectionParams;
    if (serviceType === oThis.raw) {
      connectionParams = {
        apiVersion: connectionStrategies.OS_DYNAMODB_API_VERSION,
        accessKeyId: connectionStrategies.OS_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: connectionStrategies.OS_DYNAMODB_SECRET_ACCESS_KEY,
        region: connectionStrategies.OS_DYNAMODB_REGION,
        endpoint: connectionStrategies.OS_DYNAMODB_ENDPOINT,
        sslEnabled: connectionStrategies.OS_DYNAMODB_SSL_ENABLED
      }
    }
    else if(serviceType === oThis.documentClient) {
      connectionParams = {
        apiVersion: connectionStrategies.OS_DYNAMODB_API_VERSION,
        accessKeyId: connectionStrategies.OS_DAX_ACCESS_KEY_ID,
        secretAccessKey: connectionStrategies.OS_DAX_SECRET_ACCESS_KEY,
        endpoint: connectionStrategies.OS_DAX_ENDPOINT,
        sslEnabled: connectionStrategies.OS_DYNAMODB_SSL_ENABLED
      };
      if (connectionStrategies.OS_DAX_ENABLED) {
        connectionParams.endpoint = connectionStrategies.OS_DAX_ENDPOINT;
        connectionParams.region = connectionStrategies.OS_DAX_REGION
      }
      else {
        connectionParams.endpoint = connectionStrategies.OS_DYNAMODB_ENDPOINT;
        connectionParams.region = connectionStrategies.OS_DYNAMODB_REGION
      }
    }
    connectionParams.logger = connectionStrategies.OS_DYNAMODB_LOGGING_ENABLED;
    return connectionParams;
    }

};

module.exports = new dynamoConfig();
