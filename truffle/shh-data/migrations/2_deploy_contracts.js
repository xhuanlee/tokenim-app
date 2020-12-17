var ShhData = artifacts.require('./ShhData.sol');
var admin = require('../../../config').admin;

module.exports = function (deployer) {

  deployer.deploy(ShhData, { from: admin.user_data_admin });

}
