const TRONex = artifacts.require("TRONex");

module.exports = function (deployer) {
  deployer.deploy(TRONex, '0x723edcAACeC0c1c37305f6daE80D9Dd4f42F463a', '0xBf92dCC45EA9Aa75728b062A857B016ddb4B1B84');
};
