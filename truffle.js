require('babel-register')
const config = require('./config');
const { ethereum_rpc_endpoint, admin } = config;

const str = ethereum_rpc_endpoint.split('//');
const ethereum_host = str[1].split(':')[0];
const ethereum_port = str[1].split(':')[1];

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
}

