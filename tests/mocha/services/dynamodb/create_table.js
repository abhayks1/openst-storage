const chai = require('chai'),
  assert = chai.assert;

const rootPrefix = '../../../..',
  testConstants = require(rootPrefix + '/tests/mocha/services/constants'),
  logger = require(rootPrefix + '/lib/logger/custom_console_logger'),
  helper = require(rootPrefix + '/tests/mocha/services/dynamodb/helper');

describe('Create Table', function() {
  let openStStorageObject = null;

  before(async function() {
    // get openStStorageObject
    openStStorageObject = helper.validateOpenStStorageObject(testConstants.CONFIG_STRATEGIES);
    ddb_service = openStStorageObject.dynamoDBService;
  });

  it('should delete table successfully if exists', async function() {
    const params = {
      TableName: testConstants.transactionLogTableName
    };
    const checkTableExistsResponse = await ddb_service.checkTableExist(params);
    if (checkTableExistsResponse.data.response === true) {
      await helper.deleteTable(ddb_service, params, true);
    }
  });

  it('should create table successfully', async function() {
    // build create table params
    const createTableParams = {
      TableName: testConstants.transactionLogTableName,
      KeySchema: [
        {
          AttributeName: 'tuid',
          KeyType: 'HASH'
        }, //Partition key
        {
          AttributeName: 'cid',
          KeyType: 'RANGE'
        } //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'tuid', AttributeType: 'S' },
        { AttributeName: 'cid', AttributeType: 'N' },
        { AttributeName: 'thash', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'thash_global_secondary_index',
          KeySchema: [
            {
              AttributeName: 'thash',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      SSESpecification: {
        Enabled: false
      }
    };
    await helper.createTable(ddb_service, createTableParams, true);
  });

  it('create table should fail when table name is not passed', async function() {
    // build create table params
    const createTableParams = {
      KeySchema: [
        {
          AttributeName: 'tuid',
          KeyType: 'HASH'
        }, //Partition key
        {
          AttributeName: 'cid',
          KeyType: 'RANGE'
        } //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'tuid', AttributeType: 'S' },
        { AttributeName: 'cid', AttributeType: 'N' },
        { AttributeName: 'thash', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'thash_global_secondary_index',
          KeySchema: [
            {
              AttributeName: 'thash',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      SSESpecification: {
        Enabled: false
      }
    };
    await helper.createTable(ddb_service, createTableParams, false);
  });

  // it('should enable continous backup successfully', async function () {
  //   // build create table params
  //   const enableContinousBackupParams = {
  //     TableName: testConstants.transactionLogTableName,
  //     PointInTimeRecoverySpecification: {
  //       PointInTimeRecoveryEnabled: true
  //     }
  //   };
  //   await helper.updateContinuousBackup(dynamodbApiObject, enableContinousBackupParams);
  // });

  after(async function() {
    const params = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(ddb_service, params, true);

    logger.debug('Create Table Mocha Tests Complete');
  });
});
