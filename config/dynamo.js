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
   * @param connectionParams: connectionParams of client
   * @param serviceType: type of service, either raw or docClient
   * @returns DynamoDB connection object
   *
   */
  getProvider: function (connectionParams, serviceType) {
    const oThis = this;
    oThis.serviceType = serviceType;
    oThis.connectionParams = connectionParams;
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
  }
};

module.exports = new dynamoConfig();
