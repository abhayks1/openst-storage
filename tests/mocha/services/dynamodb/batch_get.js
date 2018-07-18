/* global describe, it */

const chai = require('chai')
  , assert = chai.assert;

const rootPrefix = "../../../.."
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , testDataSource = require(rootPrefix + '/tests/mocha/services/dynamodb/testdata/batch_get_write_data')
;

var dynamoDBApi = null;

describe('Batch get', function () {
  before(async function() {
    this.timeout(100000);

    // get dynamoDB API object
    dynamoDBApi = helper.validateDynamodbApiObject(testConstants.CONFIG_STRATEGIES);

    // check if table exists
    const checkTableExistsResponse = await dynamoDBApi.checkTableExist(testDataSource.DELETE_TABLE_DATA);
    if (checkTableExistsResponse.data.response === true) {
      // delete if table exists
      await helper.deleteTable(dynamoDBApi,testDataSource.DELETE_TABLE_DATA, true);
    }

    // create table for the test
    await helper.createTable(dynamoDBApi,testDataSource.CREATE_TABLE_DATA, true);

    // populate test data
    const batchWriteParams = testDataSource.getBatchWriteDataBasedOnParam(4);
    await  helper.performBatchWriteTest(dynamoDBApi, batchWriteParams ,true);

  });

  it('batch get happy case', async function () {
    this.timeout(100000);
    const batchGetParams = {
      RequestItems: {
       [testConstants.transactionLogTableName] : {
          Keys: [
            {
              "tuid": "tuid_1",
              "cid": 1
            },
            {
              "tuid": "tuid_2",
              "cid": 2
            },
            {
              "tuid": "tuid_3",
              "cid": 3
            },
          ]
        }
      }
    };
    let returnCount = 3;
    await  helper.performBatchGetTest(dynamoDBApi, batchGetParams , true, returnCount);
  });


  it('batch get partial valid cases', async function () {
    this.timeout(100000);
    const batchGetParams = {
      RequestItems: {
        [testConstants.transactionLogTableName]: {
          Keys: [
            {
              "tuid": "tuid_1",
              "cid": 1
            },
            {
              "tuid": "tuid_2",
              "cid": 2
            },
            {
              "tuid": "tuid_5",
              "cid": 5
            },
          ]
        }
      }
    };
    let returnCount = 2;
    await  helper.performBatchGetTest(dynamoDBApi, batchGetParams , true, returnCount);
  });

  it('batch get zero keys', async function () {
    this.timeout(100000);
    const batchGetParams = {
      RequestItems: {
        [testConstants.transactionLogTableName]: {
          Keys: [
          ]
        }
      }
    };
    let returnCount = 0;
    await  helper.performBatchGetTest(dynamoDBApi, batchGetParams , false, returnCount);
  });

  it('batch get none key match keys', async function () {
    this.timeout(100000);
    const batchGetParams = {
      RequestItems: {
        [testConstants.transactionLogTableName]: {
          Keys: [
            {
              "tuid": "tuid_5",
              "cid": 5
            }
          ]
        }
      }
    };
    let returnCount = 0;
    await  helper.performBatchGetTest(dynamoDBApi, batchGetParams , true, returnCount);
  });

  after(function() {
    // runs after all tests in this block
    console.log('after function called');
    logger.debug("Batch Get Mocha Tests Complete");
  });

});



// mocha tests/mocha/services/dynamodb/