// var FaxToken = artifacts.require('./FaxToken.sol');
// var FaxTokenIM = artifacts.require('./FaxTokenIM.sol');
// var FaxTokenSale = artifacts.require('./FaxTokenSale.sol');
var UserData = artifacts.require('./UserData.sol');
// var ApiConfig = artifacts.require('./ApiConfig.sol');

var admin = require('../config').admin;

module.exports = function (deployer) {

  // 1. deploy contract Fax Token series contracts
  // deployer.deploy(FaxToken, { from: admin.token_admin }).then(() => {
  //   return deployer.deploy(FaxTokenSale, FaxToken.address, admin.token_admin, { from: admin.sale_admin }).then(() => {
  //     return deployer.deploy(FaxTokenIM, FaxToken.address, admin.token_admin, { from: admin.im_admin });
  //   })
  // })

  // 2. only deploy FaxTokenSale and FaxTokenIM
  // deployer.deploy(FaxTokenSale, '0x9a19c1a774a55eb1429b1c3eb975b3dd2bd7b812', admin.token_admin, { from: admin.sale_admin }).then(() => {
  //   return deployer.deploy(FaxTokenIM, '0x9a19c1a774a55eb1429b1c3eb975b3dd2bd7b812', admin.token_admin, { from: admin.im_admin });
  // })

  // 3. deploy UserData
  deployer.deploy(UserData, { from: admin.user_data_admin });

  // 4. deploy ApiConfig
  // params:
  //    address _ether_account,
  //    string _ether_prikey, 
  //    uint256 _ether_number, 
  //    address _ens_fax_owner,
  //    string _ens_fax_prikey,
  //    address _user_data_owner,
  //    string _user_data_prikey
  // deployer.deploy(
  //   ApiConfig,
  //   '0xD227AF0e36AE44e673b0143d7765Dc4dA9B64B68',
  //   '0x14b0a459d1a322bacd216ea47103b6418b898e939c7e3dc7da042223cfc23930',
  //   '1000000000000000000',
  //   '0xff9d40c2d790b1737729cd3a4b58c08aead2e7e1',
  //   '0xa8ccbb95137b0fbc324ac6b9cbec13e6b02da81fc4abe0c77ee1e2cc6cf82041',
  //   '0xD227AF0e36AE44e673b0143d7765Dc4dA9B64B68',
  //   '0x14b0a459d1a322bacd216ea47103b6418b898e939c7e3dc7da042223cfc23930',
  //   { from: admin.api_config_admin })
}
