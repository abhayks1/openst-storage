"use strict";

//Load external files
require('http').globalAgent.keepAlive = true;

const AWS = require('aws-sdk')
  , AWSDaxClient = require('amazon-dax-client');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;


const rootPrefix = "../"
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , coreConstants = require(rootPrefix + "/config/core_constants")
;

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
      'region': OS_DYNAMODB_REGION,
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
      'region': OS_DYNAMODB_REGION,
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
      'region': OS_DYNAMODB_REGION,
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
  documentClient: 'documentClient'
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
   * @param params
   * @returns {DynamoDB connection object}
   *
   */
  getProvider: function (params) {
    const oThis = this;
    oThis.clientID = params.clientID;
    oThis.service = params.service;
    oThis.connectionParams = oThis.getConfig(params);
    if (oThis.service == oThis.raw) {
      return oThis.createRawObject(oThis.connectionParams);
    }
    else if (oThis.service == oThis.documentClient) {
      return oThis.createDocumentClientObject(oThis.connectionParams);
    }
    return null;
  },

  createRawObject: function (connectionParams) {
    const oThis = this;
    oThis.dynamoDBObject = new AWS.DynamoDB(connectionParams);
    return oThis.dynamoDBObject;
  },

  createDocumentClientObject: function (connectionParams) {
    const oThis = this;
    if (oThis.isDaxEnabled) {
      oThis.dax = new AWSDaxClient(oThis.connectionParams);
      oThis.daxDocumentClientObject = new AWS.DynamoDB.DocumentClient({service: oThis.dax});
      return oThis.daxDocumentClientObject;
    }
    else {
      oThis.documentClientObject = new AWS.DynamoDB.DocumentClient(oThis.connectionParams);
      return oThis.documentClientObject;
    }
  },

  getConfig: function (params) {
    const oThis = this;
    oThis.clientID = params.clientID;
    oThis.service = params.service;
    var connectionParams;
    if (clientConnectionConfigMapping.has(oThis.clientID)) {
      connectionParams = clientConnectionConfigMapping[oThis.clientID][oThis.service];
    }
    else {
      connectionParams = defaultConnectionConfigMapping['default'][oThis.service];
    }
    connectionParams['sslEnabled'] = (process.env.OS_DYNAMODB_SSL_ENABLED == 1);
    connectionParams['logger'] = (process.env.OS_DYNAMODB_LOGGING_ENABLED == 1);
    return connectionParams;
  }
};

module.exports = new dynamoConfig();
