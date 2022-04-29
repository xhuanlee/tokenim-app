import Web3 from 'web3';
import Contract from 'web3-eth-contract';
import Web3HttpProvider from 'web3-providers-http';
import { default as contract } from 'truffle-contract';
import namehash from 'eth-ens-namehash';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

//import {default as FaxToken} from '../../abi/FaxToken.json';
import FaxTokenIM from '../../abi/FaxTokenIM.json';
import FaxTokenSale from '../../abi/FaxTokenSale.json';
import ENSRegistry from '../../ens/ENSRegistry.json';
import FIFSRegistrar from '../../ens/FIFSRegistrar.json'
import PublicResolver from '../../ens/PublicResolver.json';
import UserData from '../../abi/UserData.json';
import ShhData from '../../truffle/shh-data/build/contracts/ShhData.json';
import TRONex from '../../truffle/tronex/build/contracts/TRONex.json';
import WalletConnectProvider from '@walletconnect/web3-provider';
import EnsSubdomainFactory from '../../ens/EnsSubdomainFactory';
/*
const registryJSON = loadContract('registry', 'ENSRegistry')
const resolverJSON = loadContract('resolvers', 'PublicResolver')
const reverseRegistrarJSON = loadContract('registry', 'ReverseRegistrar');
*/
import registryJSON from '../../abi/ens/ENSRegistry';
import resolverJSON from '../../abi/resolver/PublicResolver';
import reverseRegistrarJSON from '../../abi/ens/ReverseRegistrar';

import { network_id } from '../../config'
import detectEthereumProvider from '@metamask/detect-provider';
import IMApp from './index';
const FaxToken = require('../../abi/FaxToken');

var chain_id;
function loadContract(modName, contractPath) {
  let loadpath
  const contractName = contractPath.split('/').reverse()[0]
  console.log(process.cwd());
  if (['ens-022', 'ethregistrar-202', 'subdomain-registrar'].includes(modName)) {
    loadpath = `${process.cwd()}/node_modules/@ensdomains/ens-archived-contracts/abis/${modName}/${contractName}.json`
  } else {
    loadpath = `${process.cwd()}/node_modules/@ensdomains/ens-contracts/artifacts/contracts/${modName}/${contractPath}.sol/${contractName}.json`
  }
  return require(loadpath)
}
const EnsContracts={
  4: {ens:'0x98325eDBE53119bB4A5ab7Aa35AA4621f49641E6',
      resolver:'0xAe41CFDE7ABfaaA2549C07b2363458154355bAbD',
      reverseRegistrar: '0xFdb1b60AdFCba28f28579D709a096339F5bEb651',
      subdomainRegistrar: '0xEE29d4293A2a701478fB930DEe29d56b8F53B115'
    },
  1515:{ens:'0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650',
    resolver:'0x5c74c94173F05dA1720953407cbb920F3DF9f887',
    fifsRegistrar:'0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8',
    reverseRegistrar:'0x34B40BA116d5Dec75548a9e9A8f15411461E8c70',
    subdomainRegistrar: null
}
};

export const FaxTokenImAPI = {
  web3: new Web3(),
  web3wallet: null,
  web3TokenContract: null,
  web3ImContract: null,
  web3SaleContract: null,
  web3EnsContract: null,
  web3FaxDomainContract: null,
  web3ResolverContract: null,
  web3DataContract: null,
  web3InvestContract: null,
  web3Ens: null,
  web3EnsSubdomainFactory: null,
  web3EnsReverseRegistrar: null,
  web3EnsResolver: null,

  tokenContract: null,
  imContract: null,
  saleContract: null,
  ensContract: null,
  faxDomainContract: null,
  resolverContract: null,
  dataContract: null,
  shhDataContract: null,
  investContract: null,

  isConnected: () => {
    return FaxTokenImAPI.web3.isConnected();
  },

  isAddress: (address) => {
    return FaxTokenImAPI.web3.isAddress(address);
  },

  setProvider: (providerURL) => {
    FaxTokenImAPI.web3.setProvider(new Web3HttpProvider(providerURL));
    return new Promise((resolve, reject) => {
      if (FaxTokenImAPI.web3.currentProvider.connected) {
        resolve(providerURL);
      } else {
        FaxTokenImAPI.web3.eth.getChainId((err,info)=>{
          console.log(err,info);
          if (err==null && FaxTokenImAPI.web3.currentProvider.connected){
            console.log('network_id:',network_id);
            chain_id = info;
            console.log('chain_id:',chain_id);
          }
          resolve(providerURL);
        }).catch(err =>{
          console.log(err);
          resolve(providerURL);
        });
//        reject(providerURL);
      }
    })
  },

  // new transaction listener for current address
  setupNewTransactionListener: (address, setFilter, callback) => {
    if (network_id!=1515)
      return;
    const contractAddress = []
    contractAddress.push(FaxToken.networks[network_id].address);
    contractAddress.push(FaxTokenSale.networks[network_id].address);
    contractAddress.push(FaxTokenIM.networks[network_id].address);
    contractAddress.push(ENSRegistry.networks[network_id].address);
    contractAddress.push(FIFSRegistrar.networks[network_id].address);
    contractAddress.push(PublicResolver.networks[network_id].address);


    const latestFilter = FaxTokenImAPI.web3.eth.subscribe('latest',(err, res) => {
      if (err) {
        console.log(err);
        callback(err,res);
      } else {
        const block = FaxTokenImAPI.web3.eth.getBlock(res, true)
        const transactions = block.transactions;
        transactions.map(t => {
          const { from, to, value } = t;
          const valueDecimal = FaxTokenImAPI.web3.toDecimal(value);
          if (from === address || to === address) {
            console.log(`new tranasction arrive: from ${from}, to ${to}, value ${valueDecimal}`);
            if (contractAddress.includes(from) || contractAddress.includes(to)) {
              console.log(`drop the event from contracts`)
            } else {
              callback(undefined, { address, from, to, value: valueDecimal })
            }
          }
          return t;
        })
      }
    });
//    setFilter(latestFilter);
//     latestFilter.watch((err, res) => {
//       if (err) {
//         console.log(err)
//         callback(err)
//       } else {
//         const block = FaxTokenImAPI.web3.eth.getBlock(res, true)
//         const transactions = block.transactions;
//         transactions.map(t => {
//           const { from, to, value } = t;
//           const valueDecimal = FaxTokenImAPI.web3.toDecimal(value);
//           if (from === address || to === address) {
//             console.log(`new tranasction arrive: from ${from}, to ${to}, value ${valueDecimal}`);
//             if (contractAddress.includes(from) || contractAddress.includes(to)) {
//               console.log(`drop the event from contracts`)
//             } else {
//               callback(undefined, { address, from, to, value: valueDecimal })
//             }
//           }
//           return t;
//         })
//       }
//     })
  },

  initTokenContract: () => {
    // web3 contract instance
//    const c = FaxTokenImAPI.web3.eth.contract(FaxToken.abi)
    FaxTokenImAPI.web3TokenContract = new Contract(FaxToken.abi, FaxToken.networks[chain_id].address);

    // truffle contract instance
    const faxTokenContract = FaxTokenImAPI.web3TokenContract;//contract(FaxToken);
    faxTokenContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      if (FaxTokenImAPI.web3TokenContract._address){
          FaxTokenImAPI.tokenContract = FaxTokenImAPI.web3TokenContract;
          resolve(FaxTokenImAPI.web3TokenContract._address);
      }
      else
        reject('');
      // faxTokenContract.deployed().then(instance => {
      //   FaxTokenImAPI.tokenContract = instance;
      //   resolve(instance.address);
      // }).catch(err => {
      //   reject(err);
      // })
    })
  },

  initIMContract: () => {
    // web3 contract instance
    // const c = FaxTokenImAPI.web3.eth.contract(FaxTokenIM.abi)
    // FaxTokenImAPI.web3ImContract = c.at(FaxTokenIM.networks[network_id].address);

    // truffle contract instance
    const faxTokenIMContract = new Contract(FaxTokenIM.abi,FaxTokenIM.abi[network_id].address);
    faxTokenIMContract.setProvider(FaxTokenImAPI.web3.currentProvider);
    FaxTokenImAPI.web3ImContract = faxTokenIMContract;

    return new Promise((resolve, reject) => {
      FaxTokenImAPI.imContract = faxTokenIMContract;
        resolve(faxTokenIMContract._address);
      // faxTokenIMContract.deployed().then(instance => {
      //   FaxTokenImAPI.imContract = instance;
      //   resolve(instance.address);
      // }).catch(err => {
      //   reject(err);
      // })
    })
  },


  initSaleContract: () => {
    // web3 contract instance
    // const c = FaxTokenImAPI.web3.eth.contract(FaxTokenSale.abi)
    // FaxTokenImAPI.web3SaleContract = c.at(FaxTokenSale.networks[network_id].address);

    // truffle contract instance
    const faxTokenSaleContract = new Contract(FaxTokenSale.abi,FaxTokenSale.networks[network_id].address);
    faxTokenSaleContract.setProvider(FaxTokenImAPI.web3.currentProvider);
    FaxTokenImAPI.web3SaleContract = faxTokenSaleContract;

    return new Promise((resolve, reject) => {
        FaxTokenImAPI.saleContract = faxTokenSaleContract;
        resolve(faxTokenSaleContract._address);
      // faxTokenSaleContract.deployed().then(instance => {
      //   FaxTokenImAPI.saleContract = instance;
      //   resolve(instance.address);
      // }).catch(err => {
      //   reject(err);
      // })
    })
  },

  testTokenContract: () => {
    new Promise((resolve => {
      FaxTokenImAPI.tokenContract.methods.symbol().call().then(result=>{
        console.log('testTokenContract',result);
        resolve(result);
      });
    }))
  },

  testIMcontract: async () => {
    return await FaxTokenImAPI.imContract.methods.admin().call();
  },

  testSaleContract: () => {
    return FaxTokenImAPI.saleContract.methods.admin().call();
  },

  testENSContract: () => {
    return FaxTokenImAPI.ensContract.methods.owner().call('0x0');
  },
  initialWalletConnect:async (connector)=>{
//    window.App.connector=connector;
    // if (window.ethereum.chainId==4)
    //   return;
    //let provider = new WalletConnectProvider({ infuraId: '27e484dcd9e3efcfd25a83a78777cdf1' });
//   let provider = new WalletConnectProvider({ infuraId: '84ae00fec54f4d65bd1c0505b0e96383' });
    const provider = new WalletConnectProvider({
      infuraId: "84ae00fec54f4d65bd1c0505b0e96383",
      qrcodeModalOptions: {
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ],
      },
    });
    await provider.enable();
    function process(){
      return new Promise(resolve => {
// Subscribe to accounts change
        provider.on("accountsChanged", (accounts) => {
          console.log(accounts);
          resolve(accounts);
        });

// Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
          console.log(chainId);
          resolve(accounts);
        });

// Subscribe to session disconnection
        provider.on("disconnect", (code, reason) => {
          console.log(code, reason);
          resolve(code);
        });
      });
    }
    FaxTokenImAPI.web3wallet = new Web3(provider);
    window.App.connector = provider;
    window.App.provider = provider;

     process();

    //  Get Accounts

//  Get Chain Id
//    const chainId = await FaxTokenImAPI.web3wallet.eth.getChainId();

    let accounts;
    accounts = await FaxTokenImAPI.web3wallet.eth.getAccounts();
    if (accounts==null)
     accounts = provider.accounts;
    window.App.loginAddress = accounts[0];
//    console.log('web3wallet provider:',JSON.stringify(provider));
    FaxTokenImAPI.web3EnsSubdomainFactory = new FaxTokenImAPI.web3wallet.eth.Contract(EnsSubdomainFactory.abi,EnsSubdomainFactory.networks[4].address);
    //console.log(registryJSON);
    FaxTokenImAPI.web3Ens = new FaxTokenImAPI.web3wallet.eth.Contract(registryJSON.abi, EnsContracts[4].ens);
//       await FaxTokenImAPI.web3Ens.deployed();
    //console.log(resolverJSON);
    FaxTokenImAPI.web3EnsResolver= new FaxTokenImAPI.web3wallet.eth.Contract(resolverJSON.abi,EnsContracts[4].resolver);
//       await FaxTokenImAPI.web3EnsResolver.deployed();
    FaxTokenImAPI.web3EnsReverseRegistrar = new FaxTokenImAPI.web3wallet.eth.Contract(reverseRegistrarJSON.abi, EnsContracts[4].reverseRegistrar);
//       await FaxTokenImAPI.web3EnsReverseRegistrar.deployed();
  },
  initENSContract: () => {
    // web3 contract instance
    if (network_id==1515) {
//      const c = FaxTokenImAPI.web3.eth.contract(ENSRegistry.abi)
      FaxTokenImAPI.web3EnsContract = new Contract(ENSRegistry.abi,ENSRegistry.networks[network_id].address);
    }
    // else
    //   if (network_id==4)
     async function initialWalletConnect() {
     let provider ;
     if (window.App.connector) {
       provider = new WalletConnectProvider({ infuraId: '27e484dcd9e3efcfd25a83a78777cdf1' });
       await provider.enable();
     }
     else
       provider = await detectEthereumProvider();

       if (provider) {
         // From now on, this should always be true:
         // provider === window.ethereum
//        startApp(provider); // initialize your app
         FaxTokenImAPI.web3wallet = new Web3(provider);
//         console.log('web3wallet provider:',JSON.stringify(provider));
//         FaxTokenImAPI.web3.setProvider(provider);
       } else {
         console.log('Please install MetaMask!');
       }
       if (provider.chainId!=1515 && provider.chainId!=4)
         return;
       const chainId= provider.chainId;
       FaxTokenImAPI.web3EnsSubdomainFactory = FaxTokenImAPI.web3wallet.eth.contract(EnsSubdomainFactory.abi).at(EnsSubdomainFactory.networks[4].address);
       //console.log(registryJSON);
       FaxTokenImAPI.web3Ens = FaxTokenImAPI.web3wallet.eth.contract(registryJSON.abi).at(EnsContracts[chainId].ens);
//       await FaxTokenImAPI.web3Ens.deployed();
       //console.log(resolverJSON);
       FaxTokenImAPI.web3EnsResolver= FaxTokenImAPI.web3wallet.eth.contract(resolverJSON.abi).at(EnsContracts[chainId].resolver);
//       await FaxTokenImAPI.web3EnsResolver.deployed();
       FaxTokenImAPI.web3EnsReverseRegistrar = FaxTokenImAPI.web3wallet.eth.contract(reverseRegistrarJSON.abi).at(EnsContracts[chainId].reverseRegistrar);
//       await FaxTokenImAPI.web3EnsReverseRegistrar.deployed();
     };
//      initialWalletConnect();
    // truffle contract instance
    const ensRegistryContract = FaxTokenImAPI.web3EnsContract;//contract(ENSRegistry);
    ensRegistryContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
        FaxTokenImAPI.ensContract = ensRegistryContract;
        resolve(ensRegistryContract.address);
      // ensRegistryContract.deployed().then(instance => {
      //   FaxTokenImAPI.ensContract = instance;
      //   resolve(instance.address);
      // }).catch(err => {
      //   reject(err);
      // })
    })
  },

  initFaxDomainContract: () => {
    // web3 contract instance
//    const c = FaxTokenImAPI.web3.eth.contract(FIFSRegistrar.abi)
    FaxTokenImAPI.web3FaxDomainContract = new Contract(FIFSRegistrar.abi,FIFSRegistrar.networks[network_id].address);

    // truffle contract instance
    const faxDomainRegistrarContract = FaxTokenImAPI.web3FaxDomainContract;//contract(FIFSRegistrar);
    faxDomainRegistrarContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      faxDomainRegistrarContract.deployed().then(instance => {
        FaxTokenImAPI.faxDomainContract = instance;
        resolve(instance._address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  initResolverContract: () => {
    // web3 contract instance
   // const c = FaxTokenImAPI.web3.eth.contract(PublicResolver.abi)
    FaxTokenImAPI.web3ResolverContract = new Contract(PublicResolver.abi,PublicResolver.networks[network_id].address);

    // truffle contract instance
    const publicResolverContract = FaxTokenImAPI.web3ResolverContract;//contract(PublicResolver);
    publicResolverContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      publicResolverContract.deployed().then(instance => {
        FaxTokenImAPI.resolverContract = instance;
        resolve(instance._address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  initUserDataContract: () => {
    // web3 contract instance
   // const c = FaxTokenImAPI.web3.eth.contract(UserData.abi)
    FaxTokenImAPI.web3DataContract = new FaxTokenImAPI.web3.eth.Contract(UserData.abi,UserData.networks[network_id].address);

    // truffle contract instance
    const userDataContract = FaxTokenImAPI.web3DataContract;//contract(UserData);
    userDataContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      userDataContract.deployed().then(instance => {
        FaxTokenImAPI.dataContract = instance;
        resolve(instance._address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  initShhDataContract: () => {
    // web3 contract instance
//    const c = FaxTokenImAPI.web3.eth.contract(ShhData.abi)
    FaxTokenImAPI.web3ShhDataContract = new Contract(ShhData.abi,ShhData.networks[network_id].address);

    // truffle contract instance
    const shhDataContract = FaxTokenImAPI.web3ShhDataContract;//contract(ShhData);
    shhDataContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      shhDataContract.deployed().then(instance => {
        FaxTokenImAPI.shhDataContract = instance;
        resolve(instance._address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  initInvestContract: () => {
    // web3 contract instance
    const c = FaxTokenImAPI.web3.eth.contract(TRONex.abi)
    FaxTokenImAPI.web3InvestContract = c.at(TRONex.networks[network_id].address);

    // truffle contract instance
    const tronexContract = contract(TRONex);
    tronexContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      tronexContract.deployed().then(instance => {
        FaxTokenImAPI.investContract = instance;
        resolve(instance._address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  // to produce transaction nonce
  getTransactionCount: (address) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.eth.getTransactionCount(address, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    })
  },
  // to produce transaction nonce
  getWalletTransactionCount: (address) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3wallet.eth.getTransactionCount(address, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    })
  },

  sendRawTransaction: (tx) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.eth.sendRawTransaction(tx, (err, txHash) => {
        if (err) {
          reject(err);
        } else {
          console.log(`success send transaction. txHash: ${txHash}`)
          resolve(txHash);
        }
      })
    })
  },

  sendTX: ({ from, to, data = null, value = 0, gas = 90000, gasPrice = 20000000000, privateKey }) => {
    return FaxTokenImAPI.getTransactionCount(from).then((nonce) => {
      const common = Common.forCustomChain('mainnet', {
        name: 'allcom',
        networkId: 1515,
        chainId: 1515,
      }, 'petersburg');
      const tx = new Transaction({ nonce: FaxTokenImAPI.web3.toHex(nonce), from, to, data, value, gas, gasPrice }, { common });
      tx.sign(privateKey);
      const serializedTx = '0x' + tx.serialize().toString('hex');
      return FaxTokenImAPI.sendRawTransaction(serializedTx);
    });
  },

  estimateGas: (param) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.eth.estimateGas(param, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // get ether balance of an address
  getEtherBalance: (address) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.eth.getBalance(address, (err, balance) => {
        if (err) {
          reject(err);
        } else {
          resolve(balance)
        }
      })
    })
  },

  // get FAX token balance of an address
  balanceOf: (address) => {
    return FaxTokenImAPI.tokenContract.methods.balanceOf.call(address);
  },

  allowance: (approver, spender) => {
    return FaxTokenImAPI.tokenContract.methods.allowance.call(approver, spender)
  },

  queryAccountBalance: (address) => {
    return FaxTokenImAPI.tokenContract.methods.balanceOf.call(address).then((token) => {
      const tokenDecimal = FaxTokenImAPI.web3.toDecimal(token);
      return new Promise((resolve, reject) => {
        FaxTokenImAPI.web3.eth.getBalance(address, (err, ether) => {
          if (err) {
            reject(err);
          } else {
            const etherDecimal = FaxTokenImAPI.web3.toDecimal(ether);
            resolve({ tokenDecimal, etherDecimal })
          }
        })
      })
    })
  },

  transferEther: (from, to, value, privateKey) => {
    return FaxTokenImAPI.sendTX({ from, to, value, privateKey });
  },

  transfer: (from, to, value, privateKey) => {
    const data = FaxTokenImAPI.web3TokenContract.transfer.getData(to, value);
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3TokenContract._address, data, privateKey })
  },

  buyFax: (from, count, value, privateKey) => {
    const data = FaxTokenImAPI.web3SaleContract.buyTokens.getData(count);
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3SaleContract._address, value, data, privateKey })
  },

  approve: (from, to, value, privateKey) => {
    const data = FaxTokenImAPI.web3TokenContract.approve.getData(to, value);
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3TokenContract._address, data, privateKey })
  },

  sendMessageByContract: (from, to, message, privateKey) => {
    const data = FaxTokenImAPI.web3ImContract.sendMessage.getData(to, message);
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3ImContract._address, data, privateKey, gas: 6000000 })
  },

  getKeystoreHashByAddress: (address) => {
    return FaxTokenImAPI.dataContract.keyStoreHash(address);
  },

  newShhKeypair: () => {
    return new Promise((resolve, reject) =>
      FaxTokenImAPI.web3.shh.newKeyPair((err, id) => {
        if (err) {
          console.log(`new shh keypair error`);
          console.log(err);
          reject(err)
        } else {
          resolve(id)
        }
      })
    );
  },

  getShhPrivateKeyById: (id) => {
    return new Promise((resolve, reject) =>
      FaxTokenImAPI.web3.shh.getPrivateKey(id, (err, priKey) => {
        if (err) {
          console.log(`get shh private key error`);
          console.log(err);
          reject(err)
        } else {
          resolve({ id, priKey });
        }
      })
    );
  },

  getShhPublicKeyById: (id) => {
    return new Promise((resolve, reject) =>
      FaxTokenImAPI.web3.shh.getPublicKey(id, (err, pubKey) => {
        if (err) {
          console.log(`get shh public key error`);
          console.log(err);
          reject(err)
        } else {
          resolve({ id, pubKey });
        }
      })
    );
  },

  getShhPublicKeyByAddress: (address) => {
    return FaxTokenImAPI.dataContract.methods.shhPubKey.call(address)
  },

  getShhPrivateKeyByAddress: (address) => {
    return FaxTokenImAPI.dataContract.methods.getShhPriKey.call({ from: address });
  },

  checkShhKeyExist: (shhKeyId) => {
    return new Promise((resolve) => {
      FaxTokenImAPI.getShhPublicKeyById(shhKeyId).then(() => {
        resolve(true)
      }).catch((err) => {
        resolve(false)
      })
    })
  },

  importShhPrivateKey: (shhPrivateKey) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.shh.addPrivateKey(shhPrivateKey, (err, shhKeyId) => {
        if (err) {
          reject(err)
        } else {
          resolve(shhKeyId);
        }
      })
    })
  },

  getSymKeyById: (symKeyId) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.shh.getSymKey(symKeyId, (err, symKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(symKey);
        }
      })
    })
  },

  getSymKeyFromContract: () => {
    if (FaxTokenImAPI.dataContract)
        return FaxTokenImAPI.dataContract.methods.shhSymKey.call();
    else
      return null;
  },

  checkSymKeyExist: (localSymKeyId) => {
    return new Promise((resolve) => {
      FaxTokenImAPI.web3.shh.hasKeyPair(localSymKeyId, (err, result) => {
        if (err) {
          resolve(false);
        } else {
          resolve(result);
        }
      })
    })
  },

  importShhSymKey: (symKey) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.shh.addSymKey(symKey, (err, symKeyId) => {
        if (err) {
          reject(err)
        } else {
          resolve(symKeyId)
        }
      })
    })
  },

  setupShhSymKeyListener: (symKeyID, callback) => {
    if (network_id==1515)
    return FaxTokenImAPI.web3.shh.newMessageFilter({ symKeyID }, callback)
  },

  sendSymMessage: ({ symKeyID, message, ttl = 7, topic = '0xffffffff', powTime = 2, powTarget = 2.01 }) => {
    console.log(message, FaxTokenImAPI.web3.fromUtf8(message))
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.shh.post({
        symKeyID,
        payload: FaxTokenImAPI.web3.fromUtf8(message),
        ttl,
        topic,
        powTime,
        powTarget,
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    })
  },

  setupShhMessageListener: (shhKeyId, callback) => {
    console.log(`new message filter: ${shhKeyId}`);
    if (network_id==1515)
    return FaxTokenImAPI.web3.shh.newMessageFilter({ privateKeyID: shhKeyId }, callback)
  },

  sendShhMessageToPubKey: ({ pubKey, message, ttl = 7, topic = '0x12345678', powTime = 2, powTarget = 2.01 }) => {
    console.log(message, FaxTokenImAPI.web3.fromUtf8(message))
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3.shh.post({
        pubKey,
        payload: FaxTokenImAPI.web3.fromUtf8(message),
        ttl,
        topic,
        powTime,
        powTarget,
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    })
  },

  sendShhMessageToAddress: ({ to, message, ttl = 7, topic = '0x12345678', powTime = 2, powTarget = 2.01 }) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.dataContract.methods.shhPubKey.call(to).then((pubKey) => {
        if (!pubKey) {
          reject(`no pub key found for ${to}`);
        } else {
          return FaxTokenImAPI.sendShhMessageToPubKey({ pubKey, message, ttl, topic, powTime, powTarget });
        }
      }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      })
    });
  },


  getENSAddressByNameOld: (name) => {
    return FaxTokenImAPI.ensContract.methods.resolver.call(namehash.hash(name)).then((resolverAddr) => {
      if (resolverAddr === '0x0000000000000000000000000000000000000000') {
        throw `no resolver address for name: ${name}`;
      } else if (resolverAddr.toLowerCase() !== FaxTokenImAPI.resolverContract._address.toLowerCase()) {
        throw `resolver not supported yet (only support .fax subdomain)`
      } else {
        return FaxTokenImAPI.resolverContract.methods.addr.call(namehash.hash(name));
      }
    })
  },
  getENSAddressByName: (name) => {
    return new Promise((resolve,reject)=>{
      FaxTokenImAPI.web3Ens.methods.resolver(namehash.hash(name)).call(null,function(error,resolverAddr) {
        if (resolverAddr === '0x0000000000000000000000000000000000000000') {
          console.log(`no resolver address for name: ${name}`);
//          resolve(FaxTokenImAPI.getENSAddressByNameOld(name));
          resolve(null);
        } else if (resolverAddr.toLowerCase() !== FaxTokenImAPI.web3EnsResolver._address.toLowerCase()) {
          console.log(`resolver not supported yet (only support .fax subdomain)`);
//          resolve(FaxTokenImAPI.getENSAddressByNameOld(name));
        } else {
          FaxTokenImAPI.web3EnsResolver.methods.addr(namehash.hash(name)).call(null,function(error,address) {
//            resolve(null);
//            console.log(name,address);
            resolve(address);
          });
        }

      })
    });
  },

  checkENSName: (name) => {
    return new Promise((resolve, reject) => {
      FaxTokenImAPI.web3Ens.methods.owner(namehash.hash(`${name}`)).call(null,function(error,address) {
        console.log(name,address);
        if (address=='0x0000000000000000000000000000000000000000'){
           if (FaxTokenImAPI.ensContract && FaxTokenImAPI.ensContract.methods)
              FaxTokenImAPI.ensContract.methods.owner(namehash.hash(`${name}.fax`)).call.then(address=>resolve(address));
           else
             resolve('');
        }
        else
          resolve(address);
      });
    });
  },

  registedReward: (address) => {
    return FaxTokenImAPI.imContract.methods.registedReward.call(address);
  },

  loginReward: (day, address) => {
    return FaxTokenImAPI.imContract.methods.loginReward.call(day, address);
  },

  getRegistedReward: (from, privateKey) => {
    const data = FaxTokenImAPI.web3ImContract.getRegistedReward.getData();
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3ImContract._address, data, privateKey })
  },

  getLoginReward: (from, privateKey) => {
    const data = FaxTokenImAPI.web3ImContract.getLoginReward.getData();
    return FaxTokenImAPI.sendTX({ from, to: FaxTokenImAPI.web3ImContract._address, data, privateKey });
  },

  uploadFileToBzz: (data) => {
    //return fetch(`${swarm_endpoint}/bzz:/`)
  },

  downloadFileFromBzz: (hash) => {
    return fetch()
  },

  getShhNameByAddress: async (address) => {
      let name = await FaxTokenImAPI.getEnsName(address);
      if (name && name.length>0)
        return name;
      else
      if (network_id==1515 && FaxTokenImAPI.shhDataContract)
        return FaxTokenImAPI.shhDataContract.methods.shhNameMap.call(address);
  },
  getEnsName: async (address) => {
    if (FaxTokenImAPI.web3EnsReverseRegistrar==null){
      //this.initENSContract();
      console.log('reverse registrar not initialized');
      return '';
    }
    return new Promise((resolve,reject)=>{
      if (FaxTokenImAPI.web3EnsReverseRegistrar.methods.node)
      FaxTokenImAPI.web3EnsReverseRegistrar.methods.node(address).call(null,function(error,mynode) {
        console.log(address+' node:',mynode);
        FaxTokenImAPI.web3EnsResolver.methods.name(mynode).call(null,function(error,name) {
          console.log(address+' name:',name);
          return resolve(name);
        });
      });
      else {
        console.log('FaxTokenImAPI.web3EnsReverseRegistrar.methods.node is null');
        resolve('');
      }
    });
    // let reverseResolverAddress=FaxTokenImAPI.web3Ens.resolver.call(mynode);
    // if (reverseResolverAddress == '0x0000000000000000000000000000000000000000')
    //   return null;
    // console.log(address+" resolver:",reverseResolverAddress);
    // let reverseResolver = FaxTokenImAPI.web3EnsResolver.attach(reverseResolverAddress);
    // let name =  reverseResolver.name.call(mynode);
    // console.log(address+' name:',name);
    // return name;
  },

  saveShhName: (name) => {
    return FaxTokenImAPI.shhDataContract.methods.saveShhName.call(name);
  },

  tokenContractInfo: () => {
    const tokenContractInfo = {
      address: '',
      owner: '',
      name: '',
      symbol: '',
      standard: '',
      totalSupply: 0,
      ownerBalance: 0,
    };
    tokenContractInfo.address = FaxTokenImAPI.tokenContract._address;

    return FaxTokenImAPI.tokenContract.methods.owner.call().then(ownerAddress => {
      // console.log(`Get tokenContract Owner: ${ownerAddress}`);
      tokenContractInfo.owner = ownerAddress;
      return FaxTokenImAPI.tokenContract.methods.name.call();
    }).then(name => {
      // console.log(`Get tokenContract name: ${name}`);
      tokenContractInfo.name = name;
      return FaxTokenImAPI.tokenContract.methods.symbol.call();
    }).then(symbol => {
      // console.log(`Get tokenContract symbol: ${symbol}`);
      tokenContractInfo.symbol = symbol;
      return FaxTokenImAPI.tokenContract.methods.standard.call();
    }).then(standard => {
      // console.log(`Get tokenContract symbol: ${standard}`);
      tokenContractInfo.standard = standard;
      return FaxTokenImAPI.tokenContract.methods.totalSupply.call();
    }).then(totalSupply => {
      // console.log(`Get tokenContract symbol: ${totalSupply}`);
      tokenContractInfo.totalSupply = totalSupply;
      return FaxTokenImAPI.tokenContract.methods.balanceOf.call(tokenContractInfo.owner);
    }).then(balance => {
      // console.log(`Get tokenContract owner balance: ${balance}`);
      tokenContractInfo.ownerBalance = balance;
      return new Promise((resolve) => {
        resolve(tokenContractInfo)
      })
    })
  },

  imContractInfo: () => {
    const imContractInfo = {
      address: '',
      owner: '',
      tokenAdmin: '',
      rewards: 0,
      allowance: 0,
      messageCount: 0,
    };
    imContractInfo.address = FaxTokenImAPI.imContract._address;

    return FaxTokenImAPI.imContract.methods.admin.call().then(ownerAddress => {
      // console.log(`Get imContract Owner: ${ownerAddress}`);
      imContractInfo.owner = ownerAddress;
      return FaxTokenImAPI.imContract.methods.tokenAdmin.call();
    }).then(tokenAdmin => {
      // console.log(`Get imContract TokenAdmin: ${tokenAdmin}`);
      imContractInfo.tokenAdmin = tokenAdmin;
      return FaxTokenImAPI.imContract.methods.rewards.call();
    }).then(rewards => {
      // console.log(`Get imContract rewards: ${rewards}`);
      imContractInfo.rewards = rewards;
      return FaxTokenImAPI.tokenContract.methods.allowance.call(imContractInfo.tokenAdmin, imContractInfo.address);
    }).then(allowance => {
      const allowanceDecimal = FaxTokenImAPI.web3.toDecimal(allowance)
      // console.log(`Get imContract allowance: ${allowanceDecimal}`);
      imContractInfo.allowance = allowanceDecimal;
      return FaxTokenImAPI.imContract.methods.messageCount.call();
    }).then(messageCount => {
      const messageCountDecimal = FaxTokenImAPI.web3.toDecimal(messageCount)
      // console.log(`Get imContract messageCount: ${messageCountDecimal}`);
      imContractInfo.messageCount = messageCountDecimal;
      return new Promise((resolve) => {
        resolve(imContractInfo)
      })
    })
  },

  saleContractInfo: () => {
    const saleContractInfo = {
      address: '',
      owner: '',
      tokenAdmin: '',
      tokenPrice: 0,
      tokensSold: 0,
      allowance: 0,
      contractEther: 0,
    };
    saleContractInfo.address = FaxTokenImAPI.saleContract._address;

    return FaxTokenImAPI.saleContract.methods.admin.call().then(ownerAddress => {
      // console.log(`Get saleContract Owner: ${ownerAddress}`);
      saleContractInfo.owner = ownerAddress;
      return FaxTokenImAPI.saleContract.methods.tokenAdmin.call();
    }).then(tokenAdmin => {
      // console.log(`Get saleContract TokenAdmin: ${tokenAdmin}`);
      saleContractInfo.tokenAdmin = tokenAdmin;
      return FaxTokenImAPI.saleContract.methods.tokenPrice.call();
    }).then(tokenPrice => {
      const tokenPriceDecimal = FaxTokenImAPI.web3.toDecimal(tokenPrice)
      // console.log(`Get saleContract tokenPrice: ${tokenPriceDecimal}`);
      saleContractInfo.tokenPrice = tokenPriceDecimal;
      return FaxTokenImAPI.saleContract.methods.tokensSold.call();
    }).then(tokensSold => {
      const tokensSoldDecimal = FaxTokenImAPI.web3.toDecimal(tokensSold)
      // console.log(`Get saleContract tokensSold: ${tokensSoldDecimal}`);
      saleContractInfo.tokensSold = tokensSoldDecimal;
      return FaxTokenImAPI.tokenContract.methods.allowance.call(saleContractInfo.tokenAdmin, saleContractInfo.address)
    }).then(allowance => {
      const allowanceDecimal = FaxTokenImAPI.web3.toDecimal(allowance)
      // console.log(`Get saleContract allowance: ${allowanceDecimal}`);
      saleContractInfo.allowance = allowanceDecimal;
      return FaxTokenImAPI.getEtherBalance(saleContractInfo.address)
    }).then(balance => {
      const contractEtherDecimal = FaxTokenImAPI.web3.toDecimal(balance)
      saleContractInfo.contractEther = contractEtherDecimal;
      // console.log(`Get saleContract contractEther: ${contractEtherDecimal}`);
      return new Promise((resolve) => {
        resolve(saleContractInfo)
      })
    })
  },

  ensContractInfo: () => {
    const ensContractInfo = {
      ensAddress: '',
      ensOwner: '',
    };
    ensContractInfo.ensAddress = FaxTokenImAPI.ensContract._address;

    return FaxTokenImAPI.ensContract.methods.owner.call('0x0').then(ownerAddress => {
      // console.log(`Get ensContract Owner: ${ownerAddress}`);
      ensContractInfo.ensOwner = ownerAddress;

      return new Promise((resolve) => {
        resolve(ensContractInfo)
      })
    })
  },

  faxDomainContractInfo: () => {
    const faxDomainInfo = {
      faxDomainAddress: '',
      faxDomainOwner: '',
      faxDomainResolver: '',
    };
    faxDomainInfo.faxDomainAddress = FaxTokenImAPI.faxDomainContract._address;
    faxDomainInfo.faxDomainResolver = FaxTokenImAPI.resolverContract._address;

    return FaxTokenImAPI.ensContract.methods.owner.call(namehash.hash('fax')).then(ownerAddress => {
      // console.log(`Get faxDomainContract Owner: ${ownerAddress}`);
      faxDomainInfo.faxDomainOwner = ownerAddress;

      return new Promise((resolve) => {
        resolve(faxDomainInfo)
      })
    })
  },

  resolverContractInfo: () => {
    const resolverInfo = {
      resolverAddress: '',
      resolverOwner: '',
    };
    resolverInfo.resolverAddress = FaxTokenImAPI.resolverContract._address;

    return FaxTokenImAPI.ensContract.methods.owner.call(namehash.hash('fax')).then(ownerAddress => {
      // console.log(`Get faxDomainResolver Owner: ${ownerAddress}`);
      resolverInfo.resolverOwner = ownerAddress;

      return new Promise((resolve) => {
        resolve(resolverInfo)
      })
    })
  },

}

export default FaxTokenImAPI;
