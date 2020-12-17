const config = require('../../config');
const { ethereum_host, ethereum_port, admin } = config;

module.exports = {
  networks: {
    development: {
      host: ethereum_host,
      port: ethereum_port,
      gas: 4700000,
      network_id: '*',
      from: admin.token_admin,
    },
  },
  compilers: {
    solc: {
      version: '0.4.24'
    }
  }
};
