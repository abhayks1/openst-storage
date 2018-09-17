'use strict';

//Load external files
require('http').globalAgent.keepAlive = true;
const rootPrefix = '..';

const InstanceComposer = require(rootPrefix + '/instance_composer'),
  AWSDDBProvider = require(rootPrefix + '/lib/providers/aws_ddb'),
  AWSDAXClientProvider = require(rootPrefix + '/lib/providers/aws_dax_client');

/**
 * Constructor for DynamoDB Config
 *
 * @constructor
 */
const DynamoConfigFactory = function(configStrategies, instanceComposer) {};

DynamoConfigFactory.prototype = {
  /**
   * Type Raw
   *
   * @constant {string}
   *
   */
  raw: 'raw',

  /**
   * Type DocumentClient
   *
   * @constant {string}
   *
   */
  dax: 'dax',

  connectionParams: {},

  /**
   * Get provider
   *
   * @param {string} preferredEndpoint - type of service, either raw or dax
   * @returns {object} - DynamoDB/Dax connection object
   *
   */
  getProvider: async function(preferredEndpoint) {
    const oThis = this;

    let configStrategies = oThis.ic().configStrategy;

    if (configStrategies.OS_DAX_ENABLED == 1 && preferredEndpoint === oThis.dax) {
      return await AWSDAXClientProvider.getInstance(configStrategies);
    } else {
      return await AWSDDBProvider.getInstance(configStrategies);
    }
  }

  //  apiVersion-accessKeyId-region-endpoint-sslEnabled
};

InstanceComposer.register(DynamoConfigFactory, 'getDynamoConfigFactory', true);

module.exports = DynamoConfigFactory;
