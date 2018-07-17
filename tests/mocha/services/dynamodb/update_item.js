const chai = require('chai')
  , assert = chai.assert;

//Load external files
const rootPrefix = "../../../.."
  , testConstants = require(rootPrefix + '/tests/mocha/services/constants')
  , logger = require(rootPrefix + "/lib/logger/custom_console_logger")
  , helper = require(rootPrefix + "/tests/mocha/services/dynamodb/helper")
;

describe('Update Item in Table', function() {

  var dynamodbApiObject = null;

  before(async function() {
    // get dynamodbApiObject
    dynamodbApiObject = helper.validateDynamodbApiObject(testConstants.DYNAMODB_DEFAULT_CONFIGURATIONS);

    // put item
    const createTableParams = {
      TableName : testConstants.transactionLogTableName,
      KeySchema: [
        {
          AttributeName: "tuid",
          KeyType: "HASH"
        },  //Partition key
        {
          AttributeName: "cid",
          KeyType: "RANGE"
        }  //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: "tuid", AttributeType: "S" },
        { AttributeName: "cid", AttributeType: "N" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    await helper.createTable(dynamodbApiObject, createTableParams, true);

    const insertItemParams = {
      TableName: testConstants.transactionLogTableName,
      Item: {
        tuid: "shardTableName",
        cid: 2,
        C: String(new Date().getTime()),
        U: String(new Date().getTime())
      }
    };
    await helper.putItem(dynamodbApiObject, insertItemParams, true);
  });

  it('should update item successfully', async function () {
    const updateItemParam = {
      ExpressionAttributeNames: {
        "#c": 'C'
      },
      ExpressionAttributeValues: {
        ":t": "2342"
      },
        Key: {
          tuid: 'shardTableName',
          cid: 2
        },
      ReturnValues: "ALL_NEW",
      TableName: testConstants.transactionLogTableName,
      UpdateExpression: "SET #c = :t"
    };

    await helper.updateItem(dynamodbApiObject, updateItemParam, true);
  });

  after(async function() {
    const deleteTableParams = {
      TableName: testConstants.transactionLogTableName
    };
    await helper.deleteTable(dynamodbApiObject, deleteTableParams, true);
    logger.debug("Update Item Mocha Tests Complete");
  });
});