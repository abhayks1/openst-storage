"use strict";

/**
 * DynamoDB Batch Write with retry count
 *
 * @module services/dynamodb/batch_get
 *
 */

const rootPrefix = "../.."
    , base = require(rootPrefix + "/services/dynamodb/base")
    , responseHelper = require(rootPrefix + '/lib/formatter/response')
    , coreConstants = require(rootPrefix + "/config/core_constants")
    , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
;

/**
 * Constructor for batch write item service class
 * @param {Object} ddbObject - DynamoDB Object
 * @param {Object} params - Parameters
 * @param {Integer} unprocessed_keys_retry_count - retry count for unprocessed keys (optional)
 *
 * @constructor
 */
const BatchGetItem = function (ddbObject, params, unprocessed_keys_retry_count) {
  const oThis = this
  ;
  oThis.unprocessedKeysRetryCount = unprocessed_keys_retry_count || 0;

  // methodName is 'batchGet' instead of 'batchGetItem' because DocumentClient supports the former.
  // More info at https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html.
  base.call(oThis, ddbObject, 'batchGet', params);
};

BatchGetItem.prototype = Object.create(base.prototype);

const batchGetPrototype = {

  /**
   * Validation of params
   *
   * @return {*}
   */
  validateParams: function () {

    const oThis = this
        , validationResponse = base.prototype.validateParams.call(oThis)
    ;
    
    if (validationResponse.isFailure()) return validationResponse;

    return responseHelper.successWithData({});
    
  },

  /**
   * Execute dynamoDB request
   *
   * @return {promise<result>}
   *
   */
  executeDbRequest: async function () {
    const oThis = this
    ;

    try {
      let batchGetParams = oThis.params
          , waitTime = 0
          , constantTimeFactor = 90
          , variableTimeFactor = 10
          , localResponse
          , globalResponse
          , attemptNo = 1
          , unprocessedKeys
          , unprocessedKeysLength
      ;

      while (true) {

        logger.info('executeDbRequest batch_get attemptNo ', attemptNo);

        localResponse = await oThis.batchGetItemAfterWait(batchGetParams, waitTime);

        if (!localResponse.isSuccess()) {
          logger.error("services/dynamodb/batch_get.js:executeDbRequest, attemptNo: ", attemptNo, localResponse.toHash());
          return responseHelper.error({
            internal_error_identifier: "s_dy_bw_executeDbRequest_1",
            api_error_identifier: "exception",
            debug_options: {error: localResponse.toHash()},
            error_config: coreConstants.ERROR_CONFIG
          });
        }

        if (!globalResponse) {
          globalResponse = localResponse;
        } else {
          // append response of each succesful (partial/complete) attempt to globalresponse
          let localResponses = localResponse.data.Responses
              , globalResponses = globalResponse.data.Responses
          ;
          for (let tableName in localResponses) {
            if (globalResponses.hasOwnProperty(tableName)) {
              globalResponses[tableName] = globalResponses[tableName].concat(localResponses[tableName]);
            } else {
              globalResponses[tableName] = localResponses[tableName]
            }
          }
        }

        unprocessedKeys = localResponse.data['UnprocessedKeys'];
        unprocessedKeysLength = 0;

        for (let tableName in unprocessedKeys) {
          if (unprocessedKeys.hasOwnProperty(tableName)) {
            unprocessedKeysLength += unprocessedKeys[tableName]['Keys'].length;
            logger.error('dynamodb BATCH_GET ATTEMPT_FAILED TableName :', tableName,
                ' unprocessedItemsCount: ', unprocessedKeysLength,
                ' keys count: ', batchGetParams.RequestItems[tableName]['Keys'].length,
                ' attemptNo ', attemptNo);
          }
        }

        // Break the loop if unprocessedItems get empty or retry count exceeds the given limit
        if (unprocessedKeysLength === 0 || oThis.unprocessedKeysRetryCount === 0) {
          globalResponse.data.UnprocessedKeys = unprocessedKeys;
          break;
        }

        //Create new batchWriteParams of unprocessedItems
        batchGetParams = {RequestItems: unprocessedKeys};

        //adjust retry variables
        attemptNo += 1;
        waitTime = constantTimeFactor + variableTimeFactor;
        variableTimeFactor += variableTimeFactor;
        oThis.unprocessedKeysRetryCount -= 1;
      }

      for (let tableName in unprocessedKeys) {
        if (unprocessedKeys.hasOwnProperty(tableName)) {
          logger.error('dynamodb BATCH_GET ALL_ATTEMPTS_FAILED TableName :', tableName,
              ' unprocessedItemsCount: ', unprocessedKeysLength,
              ' attempts Failed ', attemptNo);
        }
      }

      logger.debug("=======Base.perform.result=======");
      logger.debug(globalResponse);

      return globalResponse;

    } catch (err) {
      logger.error("services/dynamodb/batch_get.js:executeDbRequest inside catch ", err);
      return responseHelper.error({
        internal_error_identifier: "s_dy_bw_executeDbRequest_1",
        api_error_identifier: "exception",
        debug_options: {error: err.message},
        error_config: coreConstants.ERROR_CONFIG
      });
    }
  },

  /**
   * Batch get Item after waiting for given time
   * @param {Object} batchGetKeys - Batch get keys
   * @param {Integer} waitTime - wait time in milliseconds
   * @return {Promise<any>}
   */
  batchGetItemAfterWait: async function (batchGetKeys, waitTime) {
    const oThis = this
    ;

    return new Promise(function (resolve) {
      setTimeout(async function () {
        let r = await oThis.ddbObject.queryDocClient(oThis.methodName, batchGetKeys);
        resolve(r);
      }, waitTime);
    });
  }
};

Object.assign(BatchGetItem.prototype, batchGetPrototype);
BatchGetItem.prototype.constructor = batchGetPrototype;
module.exports = BatchGetItem;