'use strict';

const BasicHelper = function() {};

BasicHelper.prototype = {
  getStorageObjectKey: function(configStrategy) {
    return [
      configStrategy.OS_DAX_API_VERSION,
      configStrategy.OS_DAX_ACCESS_KEY_ID,
      configStrategy.OS_DAX_REGION,
      configStrategy.OS_DAX_ENDPOINT,
      configStrategy.OS_DAX_SSL_ENABLED,

      configStrategy.OS_DYNAMODB_API_VERSION,
      configStrategy.OS_DYNAMODB_ACCESS_KEY_ID,
      configStrategy.OS_DYNAMODB_REGION,
      configStrategy.OS_DYNAMODB_ENDPOINT,
      configStrategy.OS_DYNAMODB_SSL_ENABLED,

      configStrategy.OS_AUTOSCALING_API_VERSION,
      configStrategy.OS_AUTOSCALING_ACCESS_KEY_ID,
      configStrategy.OS_AUTOSCALING_REGION,
      configStrategy.OS_AUTOSCALING_ENDPOINT,
      configStrategy.OS_AUTOSCALING_SSL_ENABLED
    ].join('-');
  }
};

module.exports = new BasicHelper();
