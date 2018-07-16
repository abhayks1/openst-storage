"use strict";

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk')
  , AWSDaxClient = require('amazon-dax-client');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

// Default connection params mapping
const defaultConnectionConfigMapping = {
  'default': {
    dynamo: {
      'apiVersion': process.env.OS_DYNAMODB_API_VERSION,
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_ENDPOINT
    },
    DocumentClient: {
      'apiVersion': '2017-04-19',
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_DAX_ENDPOINT
    }
  }
};

// Client connection params mapping
const clientConnectionConfigMapping = {
  '1001': {
    dynamo: {
      'apiVersion': process.env.OS_DYNAMODB_API_VERSION,
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_ENDPOINT
    },
    DocumentClient: {
      'apiVersion': '2017-04-19',
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_DAX_ENDPOINT
    }
  },
  '1002': {
    dynamo: {
      'apiVersion': process.env.OS_DYNAMODB_API_VERSION,
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_ENDPOINT
    },
    DocumentClient: {
      'apiVersion': '2017-04-19',
      'accessKeyId': process.env.OS_DYNAMODB_ACCESS_KEY_ID,
      'secretAccessKey': process.env.OS_DYNAMODB_SECRET_ACCESS_KEY,
      'region': process.env.OS_DYNAMODB_REGION,
      'endpoint': process.env.OS_DYNAMODB_DAX_ENDPOINT
    }
  }
};


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
  documentClient: 'DocumentClient'
  ,

  /**
   * Type isDaxEnabled
   *
   * @constant {boolean}
   */
  isDaxEnabled: true
  ,

  /**
   * Get provider
   *
   * @param clientID: clientID of client
   * @param serviceType: type of service, either raw or docClient
   * @returns DynamoDB connection object
   *
   */
  getProvider: function (clientID, serviceType) {
    const oThis = this;
    oThis.clientID = clientID;
    oThis.serviceType = serviceType;
    oThis.connectionParams = oThis.getConfig();
    if (oThis.serviceType == oThis.raw) {
      return oThis.createRawObject();
    }
    else if (oThis.serviceType == oThis.documentClient) {
      return oThis.createDocumentClientObject();
    }
    return null;
  },

  createRawObject: function () {
    const oThis = this;
    oThis.dynamoDBObject = new AWS.DynamoDB(oThis.connectionParams);
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

  getConfig: function () {
    const oThis = this;
    let connectionParams;
    if (clientConnectionConfigMapping.hasOwnProperty(oThis.clientID)) {
      connectionParams = clientConnectionConfigMapping[oThis.clientID][oThis.serviceType];
    }
    else {
      connectionParams = defaultConnectionConfigMapping['default'][oThis.serviceType];
    }
    connectionParams['sslEnabled'] = (process.env.OS_DYNAMODB_SSL_ENABLED == 1);
    connectionParams['logger'] = (process.env.OS_DYNAMODB_LOGGING_ENABLED == 1);
    return connectionParams;
  }
};

module.exports = new dynamoConfig();
