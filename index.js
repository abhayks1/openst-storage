/**
 * Index File for openst-storage
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  entityTypesConst = require(rootPrefix + '/lib/global_constant/entity_types'),
  InstanceComposer = require(rootPrefix + '/instance_composer'),
  basicHelper = require(rootPrefix + '/helpers/basic');

require(rootPrefix + '/lib/models/dynamodb/token_balance');
require(rootPrefix + '/services/cache_multi_management/token_balance');
require(rootPrefix + '/lib/models/dynamodb/shard_helper');
require(rootPrefix + '/services/dynamodb/api');
require(rootPrefix + '/services/auto_scale/api');

const OpenSTStorage = function(configStrategy) {
  const oThis = this,
    instanceComposer = (oThis.ic = new InstanceComposer(configStrategy)),
    TokenBalanceModel = instanceComposer.getLibDDBTokenBalanceModel(),
    TokenBalanceCache = instanceComposer.getDDBTokenBalanceCache(),
    ShardHelper = instanceComposer.getLibDDBShardHelper(),
    ddbServiceObj = instanceComposer.getDynamoDBService(),
    autoScalingObject = instanceComposer.getAutoScaleService();

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  oThis.version = version;

  const model = (oThis.model = {});
  model.TokenBalance = TokenBalanceModel;
  model.ShardHelper = ShardHelper;

  const cache = (oThis.cache = {});
  cache.TokenBalance = TokenBalanceCache;

  oThis.entityTypesConst = entityTypesConst;
  oThis.dynamoDBService = ddbServiceObj;
  oThis.autoScalingService = autoScalingObject;
};

const instanceMap = {};

const Factory = function() {};

Factory.prototype = {
  getInstance: function(configStrategy) {
    // check if instance already present
    let instanceKey = basicHelper.getStorageObjectKey(configStrategy),
      _instance = instanceMap[instanceKey];

    if (!_instance) {
      _instance = new OpenSTStorage(configStrategy);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

const factory = new Factory();
OpenSTStorage.getInstance = function() {
  return factory.getInstance.apply(factory, arguments);
};

module.exports = OpenSTStorage;
