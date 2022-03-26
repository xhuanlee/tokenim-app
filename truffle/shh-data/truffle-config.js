var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "orange apple banana ... ";
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
    rinkeby: {
      provider: function() {
        return new HDWalletProvider('0x71c0d36a9152e48738d378d6adb04611c53e5d5a552221c69ad89fa7a8aba598', "https://rinkeby.infura.io/v3/84ae00fec54f4d65bd1c0505b0e96383");
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
      accounts: ['0x71c0d36a9152e48738d378d6adb04611c53e5d5a552221c69ad89fa7a8aba598'],
      from: admin.token_admin,
    }
  },
  compilers: {
    solc: {
      version: '0.4.24'
    }
  }
};

/*
D:\Users\liwei\WebstormProjects\tokenim-app\truffle\shh-data>truffle migrate --network rinkeby
Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x46a2a120e31f05105b9898d464671a4561559fdc6d726bce9d38461b71257e9a
  Migrations: 0x8ae7762e47ec0be21c25c5ebb5d6e0b768fc117d
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying ShhData...
  ... 0x1a0d0898e5cdcaf06c2262cabfd36bb27ece061c5e7bcc62f12b2f8c0cba1000
  ShhData: 0x264332fb4a47617fb0b686a6136292d5e7878eac
Saving artifacts...

 */
