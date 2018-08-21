'use strict';

/**
 *
 * This class would be used for getting shard based on id and entity type.<br><br>
 *
 * @module services/shard_management/managed_shard/get_shard
 *
 */

const rootPrefix = '../../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger');

require(rootPrefix + '/services/cache_multi_management/get_shard_details');
require(rootPrefix + '/config/core_constants');

/**
 * Constructor to create object of Get Shard Details
 *
 * @constructor
 *
 * @params {Object} params - Parameters
 * @param {String} params.entity_type - entity type
 * @param {Array} params.identifiers - Array of identifiers containing string
 *
 * @return {Object}
 *
 */

const GetShardDetails = function(params) {
  const oThis = this;
  logger.debug('=======GetShardDetails.params=======');
  logger.debug(params);
  oThis.params = params;
  oThis.entityType = params.entity_type;
  oThis.identifiers = params.identifiers;
};

GetShardDetails.prototype = {
  /**
   * Perform method
   *
   * @return {promise<result>}
   *
   */
  perform: async function() {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants();

    return oThis.asyncPerform().catch(function(err) {
      return responseHelper.error({
        internal_error_identifier: 's_sm_as_gsd_perform_1',
        api_error_identifier: 'exception',
        debug_options: { error: err },
        error_config: coreConstants.ERROR_CONFIG
      });
    });
  },

  /**
   * Async Perform
   *
   * @return {Promise<*>}
   */
  asyncPerform: async function() {
    const oThis = this,
      GetShardDetailsMultiCacheKlass = oThis.ic().getShardDetailsCacheKlass();

    let r = null;

    r = await oThis.validateParams();
    logger.debug('=======GetShardDetails.validateParams.result=======');
    logger.debug(r);
    if (r.isFailure()) return r;

    const cacheParams = {
      entity_type: oThis.entityType,
      identifiers: oThis.identifiers
    };
    r = await new GetShardDetailsMultiCacheKlass(cacheParams).fetch();
    logger.debug('=======GetShardDetails.GetShardDetailsMultiCache.result=======');
    logger.debug(r);
    if (r.isSuccess()) {
      return responseHelper.successWithData({ items: r.data });
    } else {
      return r;
    }
  },

  /**
   * Validation of params
   *
   * @return {Promise<any>}
   *
   */
  validateParams: function() {
    const oThis = this,
      coreConstants = oThis.ic().getCoreConstants(),
      errorCodePrefix = 's_sm_as_gsd_validateParams_';

    return new Promise(async function(onResolve) {
      let errorCode = null,
        error_identifier = null;

      if (!oThis.identifiers || oThis.identifiers.constructor.name !== 'Array') {
        errorCode = errorCodePrefix + '1';
        error_identifier = 'invalid_ids_array';
      }

      for (let ind = 0; ind < oThis.identifiers.length; ind++) {
        let id = oThis.identifiers[ind];
        if (!id) {
          errorCode = errorCodePrefix + '2';
          error_identifier = 'invalid_shard_identifier';
          break;
        }
      }

      if (error_identifier != null) {
        logger.debug(errorCode, error_identifier);
        return onResolve(
          responseHelper.error({
            internal_error_identifier: errorCode,
            api_error_identifier: error_identifier,
            debug_options: {},
            error_config: coreConstants.ERROR_CONFIG
          })
        );
      }

      return onResolve(responseHelper.successWithData({}));
    });
  }
};
InstanceComposer.registerShadowableClass(GetShardDetails, 'getDdbShardDetails');
module.exports = GetShardDetails;
