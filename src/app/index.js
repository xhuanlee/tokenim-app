import { notification } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { routerRedux } from 'dva/router';
import { FaxTokenImAPI } from './api';
import { showNotification, sendRequest, shortenAddress, converEther, promiseSleep } from './util';
import { ethereum_rpc_endpoint, swarm_http_endpoint, api_http_endpoint, substrate_rpc_endpoint, substrate_shh_contract_addr } from '../../config'
import { ETHEREUM_API } from './constant'
import Wallet from 'ethereumjs-wallet'
import CryptoJS from 'crypto-js'
import { TypeRegistry } from '@polkadot/types/create';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundle, typesChain, typesSpec } from '@polkadot/apps-config';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import webrtcDataAbi from '../../substrate-contracts/webrtc-data/webrtc_data.json';

const PROVIDER_URL = ethereum_rpc_endpoint;
notification.config({ top: 78 })

const IMApp = {
  PROVIDER_URL: '',
  SWARM_URL: '',
  API_URL: '',
  SUBSTRATE_RPC_URL: '',
  dispatch: null,
  api: FaxTokenImAPI,
  substrateApi: null,
  substrateShhContract: null,

  loginAddress: '',
  messageFilter: null,
  groupMessageFilter: null,
  transactionFilter: null,
  signalCallback: null,
  connector: null, //wallet connector

  init: () => {
    window.App = IMApp;
    window.Wallet = Wallet;

    // read setting from localStorage
    const providerUrl = localStorage.getItem('PROVIDER_URL') || ethereum_rpc_endpoint;
    const swarmUrl = localStorage.getItem('SWARM_URL') || swarm_http_endpoint;
    const apiUrl = localStorage.getItem('API_URL') || api_http_endpoint;
    const substrateProviderUrl = localStorage.getItem('SUBSTRATE_PROVIDER_URL') || substrate_rpc_endpoint;


    IMApp.setURL(providerUrl, swarmUrl, apiUrl, substrateProviderUrl);
  },

  setURL: (PROVIDER_URL, SWARM_URL, API_URL, SUBSTRATE_RPC_URL) => {
    IMApp.PROVIDER_URL = PROVIDER_URL || ethereum_rpc_endpoint;
    IMApp.SWARM_URL = SWARM_URL || swarm_http_endpoint;
    IMApp.API_URL = API_URL || api_http_endpoint;
    IMApp.SUBSTRATE_RPC_URL = SUBSTRATE_RPC_URL || substrate_rpc_endpoint;

    localStorage.setItem('PROVIDER_URL', IMApp.PROVIDER_URL);
    localStorage.setItem('SWARM_URL', IMApp.SWARM_URL);
    localStorage.setItem('API_URL', IMApp.API_URL);
    localStorage.setItem('SUBSTRATE_PROVIDER_URL', IMApp.SUBSTRATE_RPC_URL);

    window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { providerURL: IMApp.PROVIDER_URL, bzzURL: IMApp.SWARM_URL, apiURL: IMApp.API_URL, substrateProviderUrl: IMApp.SUBSTRATE_RPC_URL } });
    IMApp.initAndTest(PROVIDER_URL, SUBSTRATE_RPC_URL);
  },

  initAndTest: (PROVIDER_URL, SUBSTRATE_RPC_URL) => {
    if (!!window.ethereum && window.ethereum.isMetaMask) {
      window.g_app._store.dispatch({ type: 'init/saveMetamaskOk', payload: { metamaskOk: true } });
    }
    window.g_app._store.dispatch({ type: 'init/resetTestState' });
    FaxTokenImAPI.setProvider(PROVIDER_URL).then(async providerURL => {
      console.log(`provider OK!`)
      IMApp.currentProvider = providerURL;
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { providerOK: true, providerURL } });

      console.log('initTokenContract ...');
      await IMApp.initTokenContract();
      console.log('initIMContract ...');
      await IMApp.initIMContract();
      console.log('initShhDataContract ...');
      IMApp.initShhDataContract();
      console.log('initSaleContract ...');
      IMApp.initSaleContract();
      console.log('initENSContract ...');
      IMApp.initENSContract();
      console.log('initFaxDomainContract ...');
      IMApp.initFaxDomainContract();
      console.log('initResolverContract ...');
      IMApp.initResolverContract();
      console.log('initUserDataContract ...');
      IMApp.initUserDataContract();
      // IMApp.initInvestContract();
//weili, substrate not supported yet      IMApp.initSubstrate();
    }).catch(providerURL => {
      console.log(`provider error, can not connect to ${providerURL}!`)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { providerOK: false, providerURL, initError: true } });
    });
    window.FaxTokenImAPI = FaxTokenImAPI;
  },

  initSubstrate: async () => {
    try {
      if (IMApp.substrateApi && IMApp.substrateApi.disconnect) {
        IMApp.substrateApi.disconnect();
      }

      const registry = new TypeRegistry();
      const provider = new WsProvider(IMApp.SUBSTRATE_RPC_URL);
      IMApp.substrateApi = await ApiPromise.create({
        provider,
        registry,
        types: {},
        typesBundle,
        typesSpec,
        typesChain,
      });

      const abi = new Abi(webrtcDataAbi, { registry: IMApp.substrateApi.registry });
      IMApp.substrateShhContract = new ContractPromise(IMApp.substrateApi, abi, substrate_shh_contract_addr);
///weili      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { substrateProviderUrl: IMApp.SUBSTRATE_RPC_URL } });
      console.log('init substrate contract & api success.')
    } catch (e) {
      console.error('init substrate error: ', e);
    }
  },

  initTokenContract: () => {
    // init
    FaxTokenImAPI.initTokenContract().then(async (tokenContractAddress) => {
      console.log('FaxToken Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { tokenContractOK: true, tokenContractAddress } });
      // test
      return await FaxTokenImAPI.testTokenContract();
    }).then(symbol => {
      console.log(`FaxToken Contract Call OK! Fax Token Symbol: ${symbol}`);
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { tokenContractAvaiable: true } });
    }).catch(err => {
      console.log(`FaxToken init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { tokenContractAvaiable: false, initError: true } });
    })
  },

  initIMContract: () => {
    // init
    FaxTokenImAPI.initIMContract().then((imContractAddress) => {
      console.log('FaxTokenIM Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { imContractOK: true, imContractAddress } });
      // test
      return FaxTokenImAPI.testIMcontract();
    }).then(owner => {
      console.log(`FaxTokenIM Contract Call OK! Contract Owner is:${owner}`);
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { imContractAvaiable: true } });
    }).catch(err => {
      console.log(`FaxTokenIM init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { imContractAvaiable: false, initError: true } });
    })
  },

  initSaleContract: () => {
    // init
    FaxTokenImAPI.initSaleContract().then((saleContractAddress) => {
      console.log('FaxTokenSale Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { saleContractOK: true, saleContractAddress } });
      // test
      return FaxTokenImAPI.testSaleContract();
    }).then(owner => {
      console.log(`FaxTokenSale Contract Call OK! Contract Owner is:${owner}`);
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { saleContractAvaiable: true } });
    }).catch(err => {
      console.log(`FaxTokenSale init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { saleContractAvaiable: false, initError: true } });
    })
  },

  initENSContract: () => {
    // init
    FaxTokenImAPI.initENSContract().then((ensAddress) => {
      console.log('ENSRegistry Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { ensContractOK: true, ensAddress } });
      // test
      return FaxTokenImAPI.testENSContract();
    }).then(owner => {
      console.log(`ENSRegistry Contract Call OK! Contract Owner is:${owner}`);
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { ensContractAvaiable: true } });
    }).catch(err => {
      console.log(`ENSRegistry init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { ensContractAvaiable: false, initError: true } });
    })
  },

  initFaxDomainContract: () => {
    // init
    FaxTokenImAPI.initFaxDomainContract().then((faxDomainAddress) => {
      console.log('FIFSRegistrar(.fax) Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { faxDomainContractOK: true, faxDomainAddress } });
    }).catch(err => {
      console.log(`FIFSRegistrar(.fax) init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { faxDomainContractOK: false, initError: true } });
    })
  },

  initResolverContract: () => {
    // init
    FaxTokenImAPI.initResolverContract().then((resolverAddress) => {
      console.log('PublicResolver Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { resolverContractOK: true, resolverAddress } });
    }).catch(err => {
      console.log(`PublicResolver init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { resolverContractOK: false, initError: true } });
    })
  },

  initUserDataContract: () => {
    // init
    FaxTokenImAPI.initUserDataContract().then((userDataAddress) => {
      console.log('UserData Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { userDataContractOK: true, userDataAddress } });
    }).catch(err => {
      console.log(`UserData init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { userDataContractOK: false, initError: true } });
    })
  },

  initShhDataContract: () => {
    // init
    FaxTokenImAPI.initShhDataContract().then((shhDataAddress) => {
      console.log('ShhData Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { shhDataContractOK: true, shhDataAddress } });
    }).catch(err => {
      console.log(`ShhData init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { shhDataContractOK: false, initError: true } });
    })
  },

  initInvestContract: () => {
    // init
    FaxTokenImAPI.initInvestContract().then((investAddress) => {
      console.log('invest Contract is OK!')
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { investContractOK: true, investAddress } });
    }).catch(err => {
      console.log(`invest contract init error`);
      console.log(err)
      window.g_app._store.dispatch({ type: 'init/saveInitState', payload: { investContractOK: false, initError: true } });
    })
  },

  setSiganlCallback: (cb) => {
    IMApp.signalCallback = cb;
  },

  checkENSAvaiable: (name) => {
    FaxTokenImAPI.checkENSName(name).then((owner) => {
      if (owner === '0x0000000000000000000000000000000000000000') {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: true } })
      } else {
        console.log(`name has been registed`);
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: false } })
      }
    }).catch((err) => {
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: false } })
      console.log(`get ens name ${name}.fax owner error`)
      console.log(err);
    })
  },

  getEnsUserData: (name) => {
    // check name is registed
    FaxTokenImAPI.checkENSName(name).then(async (owner) =>  {
      console.log(owner)
      if (owner === '0x0000000000000000000000000000000000000000') {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: true } })
      } else {
        // get address from name
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: false } })
        return await FaxTokenImAPI.getENSAddressByName(`${name}`)
      }
    }).then((addr) => {
      if (addr && addr === '0x0000000000000000000000000000000000000000') {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryShhLoading: false, queryENSAvaiable: true, queryENSAddress: '' } })
      } else if (addr) {
        // if adress is ok, then get shh public key
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: false, queryENSAddress: addr } })
        return FaxTokenImAPI.getShhPublicKeyByAddress(addr)
      }
    }).then((pubKey) => {
      console.log(`query shh public key result: ${pubKey}`)
      if (pubKey) {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryShhLoading: false, queryShhPubKey: pubKey } })
      }
    }).catch((err) => {
      console.log('query shh public key ',err)
      if (err === `no resolver address for name: ${name}.fax`) {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: false } })
      } else {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryENSLoading: false, queryENSAvaiable: true } })
        console.log(`get ens name ${name}.fax owner error`)
        console.log(err);
      }
    })
  },

  addNewFriend: (friendAddress, ensName, shhPublicKey) => {
    if (shhPublicKey) {
      window.g_app._store.dispatch({ type: 'user/addFriend', payload: { friendAddress, ensName, shhPubKey: shhPublicKey } });
      return;
    }
    FaxTokenImAPI.getShhPublicKeyByAddress(friendAddress).then((shhPubKey) => {
      window.g_app._store.dispatch({ type: 'user/addFriend', payload: { friendAddress, ensName, shhPubKey } })
    }).catch((err) => {
      window.g_app._store.dispatch({ type: 'user/addFriend', payload: { friendAddress, ensName } })
      console.log(err);
    })
  },

  jumpToChatUser: async (address, name) => {
    try {
      let shhPubKey = await FaxTokenImAPI.getShhPublicKeyByAddress(address);
      if (!shhPubKey) {
        return;
      }
      let ensName = await FaxTokenImAPI.getShhNameByAddress(address);
      ensName = ensName || name || address;
      IMApp.addNewFriend(address, ensName, shhPubKey);
      const chatUser = { address, ensName, shhPubKey, time: new Date().getTime() };
      window.g_app._store.dispatch({ type: 'media/saveChatUser', payload: { chatUser } });
    } catch (e) {
      console.error('jump to user error: ', e);
    }
  },

  getAddressUserData: (address) => {
    FaxTokenImAPI.getShhPublicKeyByAddress(address).then((pubKey) => {
      if (pubKey) {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryShhLoading: false, queryShhPubKeyByAddress: pubKey } })
      }
    }).catch((err) => {
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryShhLoading: false } })
      console.log(err);
    })
  },

  newShhKeypair: async (address) => {
    const keypair = {
      id: 0,
      priKey: '',
      pubKey: '',
    }

    try {
      const shhId = await FaxTokenImAPI.newShhKeypair();
      const shhPk = await FaxTokenImAPI.getShhPrivateKeyById(shhId);
      const shhPub = await FaxTokenImAPI.getShhPublicKeyById(shhId);
      const { priKey } = shhPk;
      const { pubKey } = shhPub;
      keypair.id = shhId;
      keypair.priKey = priKey;
      keypair.pubKey = pubKey;
      await IMApp.saveShhKeypair(address, keypair);
    } catch (e) {
      console.log(e);
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { newShhKeyError: true } });
    }
  },

  saveShhKeypair: async (address, keypair) => {
    const { id, priKey, pubKey } = keypair;
    // save to contract
    return new Promise((resolve) => {
      sendRequest(`${IMApp.API_URL}${ETHEREUM_API.SET_SHH_KEY}${address}`, (err, res) => {
        if (err) {
          console.log(`save shh key to contract error`);
          console.log(err);
        } else if (res.err !== 0) {
          console.log(`save shh key to contract error`);
          console.log(res.msg);
        } else {
          // save to local
          IMApp.saveShhKeypairToLocal(address, keypair)
          window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyId: id, shhPriKey: priKey, shhPubKey: pubKey, shhKeyAvaiable: true } });
        }

        resolve();
      }, JSON.stringify({ priKey, pubKey }));
    });
  },

  saveShhKeypairToLocal: (address, keypair) => {
    const { id, priKey, pubKey } = keypair;
    const ShhKeyStr = localStorage.getItem('ShhKey') || '{}';
    let ShhKeyObj = {};
    try {
      ShhKeyObj = JSON.parse(ShhKeyStr);
    } catch (e) {
      console.log(e)
    }
    let ShhKey = ShhKeyObj[PROVIDER_URL] || {};
    ShhKey[address] = { id, priKey, pubKey };
    ShhKeyObj[PROVIDER_URL] = ShhKey;
    localStorage.setItem('ShhKey', JSON.stringify(ShhKeyObj));
  },

  getShhKeyPair: (address) => {
    // get public key from local
    const ShhKeyStr = localStorage.getItem('ShhKey') || '{}';
    let ShhKeyObj = {};
    try {
      ShhKeyObj = JSON.parse(ShhKeyStr);
    } catch (e) {
      console.log(e)
    }
    const ShhKey = ShhKeyObj[PROVIDER_URL] || {};
    const localShhId = ShhKey[address] && ShhKey[address].id
    const localPubKey = ShhKey[address] && ShhKey[address].pubKey;
    const localPriKey = ShhKey[address] && ShhKey[address].priKey;
    if (localShhId && localPubKey && localPriKey) {
      if (!IMApp.messageFilter) {
        IMApp.messageFilter = FaxTokenImAPI.setupShhMessageListener(localShhId, IMApp.newMessageArrive);
      }
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyId: localShhId, shhPubKey: localPubKey, shhPriKey: localPriKey, shhKeyAvaiable: true } });
      return ;
    }

    var keypair = {};
    // if shh key not exist, create a new one

    FaxTokenImAPI.getShhPublicKeyByAddress(address).then((publicKey) => {
      console.log(`get ssh key by address: ${address} -> ${publicKey}`);
      if (!publicKey) {
        console.log('new ssh key pair.')
        IMApp.newShhKeypair(address);
      } else {
        // get public key from contract
        FaxTokenImAPI.getShhPublicKeyByAddress(address).then((publicKey) => {
          keypair.pubKey = publicKey;
          if (localPubKey === publicKey) {
            return new Promise(resolver => resolver(localPriKey));
          } else {
            console.log(`local pubkey not match ${localPubKey}, ${publicKey}`)
            return FaxTokenImAPI.getShhPrivateKeyByAddress(address);
          }
        }).then(privateKey => {
          keypair.priKey = privateKey;
          return FaxTokenImAPI.checkShhKeyExist(localShhId)
        }).then(exist => {
          if (localPubKey === keypair.pubKey && exist) {
            return new Promise(resolver => resolver(localShhId))
          } else {
            return FaxTokenImAPI.importShhPrivateKey(keypair.priKey);
          }
        }).then(shhKeyId => {
          keypair.id = shhKeyId;
          if (!IMApp.messageFilter) {
            IMApp.messageFilter = FaxTokenImAPI.setupShhMessageListener(shhKeyId, IMApp.newMessageArrive)
          }
          IMApp.saveShhKeypairToLocal(address, keypair)
          window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyId, shhPubKey: keypair.pubKey, shhPriKey: keypair.priKey, shhKeyAvaiable: true } })
        }).catch((err) => {
          console.log(`get ssh key error`);
          console.log(err);
          window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyAvaiable: false } })
        })
      }
    })
  },

  saveSymKeyToLocal: (SymKey) => {
    const SymKeyStr = localStorage.getItem('SymKey') || '{}';
    let SymKeyObj = {};
    try {
      SymKeyObj = JSON.parse(SymKeyStr);
    } catch (e) {
      console.log(e)
    }
    SymKeyObj[PROVIDER_URL] = SymKey;
    localStorage.setItem('SymKey', JSON.stringify(SymKeyObj));
  },

  getShhSymId:()=>{
    // get shh sym key from local
    const SymKeyStr = localStorage.getItem('SymKey') || '{}';
    let SymKeyObj = {};
    try {
      SymKeyObj = JSON.parse(SymKeyStr);
    } catch (e) {
      console.log(e)
    }
    const SymKey = SymKeyObj[PROVIDER_URL] || {};
    const localSymKeyId = SymKey && SymKey.id || '';
    return localSymKeyId;
  },
  getShhSymKey: () => {
    // get shh sym key from local
    const SymKeyStr = localStorage.getItem('SymKey') || '{}';
    let SymKeyObj = {};
    try {
      SymKeyObj = JSON.parse(SymKeyStr);
    } catch (e) {
      console.log(e)
    }
    const SymKey = SymKeyObj[PROVIDER_URL] || {};
    const localSymKeyId = SymKey && SymKey.id || '';
    const localSymKey = SymKey && SymKey.key || '';

    // vertify is sym key is avaiable in current ethereum endpoint
    FaxTokenImAPI.web3.shh.getSymKey(localSymKeyId, (err, symKey) => {
      if (!err && localSymKeyId && localSymKey && symKey === localSymKey) {
        IMApp.groupMessageFilter = FaxTokenImAPI.setupShhSymKeyListener(localSymKeyId, IMApp.newMessageArrive)
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { symKeyId: localSymKeyId, symKey: localSymKey, symKeyAvaiable: true } })
      } else {
        // get shh sym from contract
        let SymKeyObj = {};
        FaxTokenImAPI.getSymKeyFromContract().then((symKey) => {
          SymKeyObj.key = symKey;
          return FaxTokenImAPI.importShhSymKey(symKey);
        }).then((symKeyId) => {
          SymKeyObj.id = symKeyId;
          IMApp.saveSymKeyToLocal(SymKeyObj)
          IMApp.groupMessageFilter = FaxTokenImAPI.setupShhSymKeyListener(symKeyId, IMApp.newMessageArrive)
          window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { symKeyId, symKey: SymKeyObj.key, symKeyAvaiable: true } })
        }).catch((err) => {
          console.log(`get symkey error`)
          console.log(err)
          window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { symKeyAvaiable: false } })
        })
      }
    })
  },

  newMessageArrive: (err, message,subscription) => {
    if (err) {
      console.log(`message error`);
      console.log(err,message);
    } else {
      console.log('newMessageArrive:',message);
      if (message && message.payload) {
        const payload = FaxTokenImAPI.web3.utils.toUtf8(message.payload);
        var msg = null;
        try {
          msg = JSON.parse(payload);
        } catch (e) {
          console.log(`parse message error`)
          console.log(e)
        }

        // receive webrtc signal message
        if (msg && msg.signal) {
          IMApp.signalCallback && IMApp.signalCallback(msg);
          return ;
        }

        if (msg) {
          console.log(msg)
          const displayName = msg.name || shortenAddress(msg.from, 18);
          const title = msg.group ? formatMessage({ id: 'public_group' }) : `${displayName}`
          const type = msg.type === 'image' ? formatMessage({ id: 'image' }) : formatMessage({ id: 'new_message' });
          if (!IMApp.loginAddress || msg.from !== IMApp.loginAddress) {
            showNotification('newMessage', 'info', `${formatMessage({ id: 'receive_from' })} ${title} ${type}`)
          }
          window.g_app._store.dispatch({ type: 'user/receiveNewMessage', payload: msg })
        }
      }
      else
        FaxTokenImAPI.web3.shh.getFilterMessages(message)
          .then(result=>{
            console.log(message+':',result);
          });
    }
  },

  newTransactionArrive: (err, msg) => {
    if (err) {
      console.log(`transaction error`);
      console.log(err);
    } else {
      console.log(`transaction msg:`,msg);
      const {address, from, to , value } = msg;
      if (address === from) {
        const toAddress = shortenAddress(to, 18);
        const etherValue = converEther(value).value;
        const etherUnit = converEther(value).unit;
        showNotification('transactionDone', 'success', `${formatMessage({ id: 'success_transfer' })} ${etherValue} \n ${formatMessage({ id: 'to' })}${etherUnit} ${toAddress}`)
        window.g_app._store.dispatch({ type: 'user/getBalance' })
      } else if (address === to) {
        const fromAddress = shortenAddress(from, 18);
        const etherValue = converEther(value).value;
        const etherUnit = converEther(value).unit;
        showNotification('receiveTransaction', 'info', `${formatMessage({ id: 'receive_from' })} ${fromAddress}， ${formatMessage({ id: 'eth_account' })} ${etherValue}：${etherValue} ${etherUnit}`)
        window.g_app._store.dispatch({ type: 'user/getBalance' })
      } else {
        console.log(`unknow transaction`)
      }
    }
  },

  checkShhStatusById: (shhKeyId) => {
    FaxTokenImAPI.checkShhKeyExist(shhKeyId).then((exist) => {
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyAvaiable: exist } })
    });
  },

  getFreeEther: (address) => {
    return new Promise((resolve, reject) => {
      sendRequest(`${IMApp.API_URL}${ETHEREUM_API.GET_FREE_ETHER}${address}`, (err, res) => {
        if (err || res.err !== 0) {
          console.log(`get free ether error`);
          console.log(err);
          console.log(res.msg)
          reject(res.msg)
        } else {
          resolve()
          console.log(`get free ether success`)
        }
      })
    })
  },

  newWalletAccount: async (password) => {
    const { wallet, aes_pk, md5_pk } = await IMApp.newWalletAesEncrypt(password);
    const address = wallet.getAddressString();
    await IMApp.newShhKeypair(address);
    await promiseSleep(500);
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { wallet, registerLoading: false, registerError: false, registerAddress: wallet.getAddressString(), registerENSName: '', regsiterPkAes: aes_pk, registerPkMd5: md5_pk } })
    window.g_app._store.dispatch(routerRedux.push('/regSuccess'))

    // get free 1 Ether to new account
    IMApp.getFreeEther(address).then(() => {
      console.log('success get ether')
    });
  },

  newENSAccount: async (ensName, password) => {
    const { wallet, aes_pk, md5_pk } = await IMApp.newWalletAesEncrypt(password);
    const address = wallet.getAddressString();
    await IMApp.newShhKeypair(address);
    await promiseSleep(500);
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { wallet, registerLoading: false, registerENSLoading: true, registerError: false, registerAddress: address, regsiterPkAes: aes_pk, registerPkMd5: md5_pk } })
    sendRequest(`${IMApp.API_URL}${ETHEREUM_API.REGISTER_ENS}${address}/${ensName}`, (err, res) => {
      if (err) {
        console.log(`register ens error.`);
        console.log(err);
        showNotification('newAccount', 'error', formatMessage({ id: 'ens_register_error_notice' }));
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { registerENSLoading: false, registerError: true } })
      } else if (res.err !== 0) {
        console.log(`register ens error.`);
        console.log(res.msg);
        showNotification('newAccount', 'error', res.msg);
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { registerENSLoading: false, registerError: true } })
      } else {
        IMApp.saveENSToLocal(ensName, address)
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { registerENSLoading: false, registerError: false } })
        window.g_app._store.dispatch(routerRedux.push('/regSuccess'))

        // get free 1 Ether to new account
        IMApp.getFreeEther(address).then(() => {
          console.log('success get ether')
        });
      }
    })
  },

  saveENSToLocal: (ensName, address) => {
    const EnsListStr = localStorage.getItem('ENSUserListLocal') || '{}';
    let ENSListObj = {};
    try {
      ENSListObj = JSON.parse(EnsListStr);
    } catch (e) {
      console.log(e)
    }
    const ENSUserList = ENSListObj[PROVIDER_URL] || [];
    var filterEnsList = ENSUserList.filter(i => i.ens !== `${ensName}.fax`)
    filterEnsList.unshift({ ens: `${ensName}.fax`, address, time: new Date().getTime() })
    ENSListObj[PROVIDER_URL] = filterEnsList;
    localStorage.setItem('ENSUserListLocal', JSON.stringify(ENSListObj));
  },

  newWalletAesEncrypt: async (password) => {
    var newWallet = Wallet.generate();
    var address = newWallet.getAddressString();
    var aes_pk = CryptoJS.AES.encrypt(newWallet.getPrivateKeyString(), password).toString();
    var md5_pk = CryptoJS.MD5(newWallet.getPrivateKeyString()).toString();

    const WalletListStr = localStorage.getItem('WalletListAES') || '{}';
    let WalletObj = {};
    try {
      WalletObj = JSON.parse(WalletListStr);
    } catch (e) {
      console.log(e)
    }
    let WalletList = WalletObj[PROVIDER_URL] || [];
    const keystore = { address, aes_pk, md5_pk, time: new Date().getTime() };

    WalletList.unshift(keystore);
    WalletObj[PROVIDER_URL] = WalletList;
    localStorage.setItem('WalletListAES', JSON.stringify(WalletObj));
    console.log(`new wallet done! ${address}`);

    // 防止transaction未提交，延迟 1 秒执行
    await IMApp.saveKeystoreToServer(address, keystore);
    await promiseSleep(500);

    return {
      wallet: newWallet,
      address,
      aes_pk,
      md5_pk,
    }
  },

  newWallet: async (password) => {
    var newWallet = Wallet.generate();
    var address = newWallet.getAddressString();
    var keystore = newWallet.toV3String(password);
    const WalletListStr = localStorage.getItem('WalletList') || '{}';
    let WalletObj = {};
    try {
      WalletObj = JSON.parse(WalletListStr);
    } catch (e) {
      console.log(e)
    }
    let WalletList = WalletObj[PROVIDER_URL] || [];
    WalletList.unshift({ address, keystore, time: new Date().getTime() })
    WalletObj[PROVIDER_URL] = WalletList;
    localStorage.setItem('WalletList', JSON.stringify(WalletObj));

    console.log(`new wallet done! ${address}`)

    // 防止transaction未提交，延迟 1 秒执行
    await IMApp.saveKeystoreToServer(address, keystore);
    await promiseSleep(500);

    return {
      wallet: newWallet,
      keystore: keystore,
    };
  },

  saveKeystoreToServer: async (address, keystore) => {
    try {
      return new Promise((resolve) => {
        sendRequest(`${IMApp.API_URL}${ETHEREUM_API.SAVE_KEYSTORE}${address}`, (err, res) => {
          if (err) {
            console.log(`save keystore to server error.`);
            console.log(err);
          } else if (res.err !== 0) {
            console.log(`save keystore to server error.`);
            console.log(res.msg);
          } else {
            console.log(`save keystore success`);
          }

          resolve();
        }, JSON.stringify({ keystore: JSON.stringify(keystore) }));
      });
      // save keystore to contract
    } catch (e) {
      console.error('save keystore error: ', e);
    }
  },

  getEncryptPrivateKeyByAddress: async (address) => {
    const WalletListStr = localStorage.getItem('WalletListAES') || '{}';
    let WalletObj = {};
    try {
      WalletObj = JSON.parse(WalletListStr);
    } catch (e) {
      console.log(e)
    }
    let WalletList = [];
    const providerList = Object.keys(WalletObj);
    providerList.map(p => WalletList = WalletList.concat(WalletObj[p]));
    const w = WalletList.filter(i => i.address === address);
    if (w.length > 0) {
      return w[0];
    }

    try {
      const response = await fetch(`${IMApp.API_URL}${ETHEREUM_API.GET_KEYSTORE}${address}`);
      if (response.status !== 200) {
        return undefined;
      }
      const body = await response.json();
      const { err, keystore: kstr } = body;
      if (err !== 0) {
        return undefined;
      }
      const keystore = JSON.parse(kstr);
      console.log('get key store success: ', keystore);
      return keystore;
    } catch (e) {
      console.error('get keystore from server error: ', e);
    }

    return undefined;
  },

  getKeystoreByAddress: (address) => {
    const WalletListStr = localStorage.getItem('WalletList') || '{}';
    let WalletObj = {};
    try {
      WalletObj = JSON.parse(WalletListStr);
    } catch (e) {
      console.log(e)
    }
    let WalletList = [];
    const providerList = Object.keys(WalletObj);
    providerList.map(p => WalletList = WalletList.concat(WalletObj[p]));
    const w = WalletList.filter(i => i.address === address);
    if (w.length > 0) {
      return w[0].keystore;
    } else {
      return undefined;
    }
  },

  decypetKeystore: (keystore, password) => {
    try {
      const wallet = Wallet.fromV3(keystore, password);
      console.log(`decrpte keystore success`);
      return wallet;
    } catch (err) {
      console.log(`decrypt keystore error`)
      console.log(err);
      return undefined;
    }
  },

  vertifyPassword: (aes_pk, md5_pk, password) => {
    try {
      const pk = CryptoJS.AES.decrypt(aes_pk, password).toString(CryptoJS.enc.Utf8);
      const pk_hash = CryptoJS.MD5(pk).toString();
      // 通过密码验证
      if (pk_hash.toString() == md5_pk.toString()) {
        const privateKey = pk.length === 66 ? pk.substring(2) : pk;
        var wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        return wallet
      }
      return null;
    } catch (e) {
      console.log('decrypt private key error')
      return null;
    }
  },

  loginWithAddress: async (address, password, query) => {
    const pk_info = await IMApp.getEncryptPrivateKeyByAddress(address) || {};
    const { aes_pk, md5_pk } = pk_info;
    if (aes_pk && md5_pk) {
      const wallet = IMApp.vertifyPassword(aes_pk, md5_pk, password)
      if (wallet) {
        IMApp.loginAddress = address;
        IMApp.getShhKeyPair(address);
        IMApp.getShhSymKey();
        FaxTokenImAPI.setupNewTransactionListener(address, (filter) => { IMApp.transactionFilter = filter }, IMApp.newTransactionArrive)
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { wallet, loginLoading: false, loginPkAes: aes_pk, loginPkMd5: md5_pk, auth: true, loginAddress: address, address, visitorMode: false } })
        showNotification('login', 'success');
        let q = {};
        if (query) {
          q = query;
          delete q['redirect_uri'];
        }
        window.g_app._store.dispatch(routerRedux.push({ pathname: '/home', query: q }));
      } else {
        showNotification('login', 'error', formatMessage({ id: 'password_error_notice' }));
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { wallet, loginLoading: false, loginPkAes: aes_pk, loginPkMd5: md5_pk } })
      }
    } else {
      console.log(`no keystore found fro ${address}`);
      showNotification('login', 'error', formatMessage({ id: 'no_keystore_notice' }))
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { loginLoading: false } })
    }
  },

  loginWithEns: (ensName, password, query) => {
    FaxTokenImAPI.getENSAddressByName(`${ensName}.fax`).then((address) => {
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { loginLoading: true, ensLoading: false, loginEns: ensName } })
      setTimeout(() => IMApp.loginWithAddress(address, password, query), 1000);
    }).catch((err) => {
      console.log(`can't find address for ${ensName}.fax`)
      console.log(err)
      showNotification('login', 'error', `${ensName}.fax ${formatMessage({ id: 'address_resolve_error_notice' })}`);
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { loginLoading: false, ensLoading: false, loginError: true } })
    });
  },

  loginInVisitorMode: () => {
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { wallet: null, loginAddress: '', loginEns: '', loginKeystore: '', loginLoading: false, address: '', auth: false, visitorMode: true, } })
    window.g_app._store.dispatch(routerRedux.push('/home'))
    IMApp.getShhSymKey();
  },

  logout: () => {
    IMApp.messageFilter && IMApp.messageFilter.stopWatching();
    IMApp.groupMessageFilter && IMApp.groupMessageFilter.stopWatching();
    IMApp.transactionFilter && IMApp.transactionFilter.stopWatching();

    IMApp.loginAddress = '';
    IMApp.messageFilter = null;
    IMApp.groupMessageFilter = null;
    IMApp.transactionFilter = null;
    if (IMApp.connector)
      IMApp.connector.killSession();
  },

  balanceOf: (address) => {
    if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { getBalanceError: false } })
      FaxTokenImAPI.queryAccountBalance(address).then(({ tokenDecimal, etherDecimal }) => {
        window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { balanceLoading: false, etherBalance: etherDecimal, faxBalance: tokenDecimal } })
      }).catch((err) => {
        console.log(`get balance of ${address} error`)
        console.log(err)
        window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { balanceLoading: false, getBalanceError: true } })
      });
    } else {
//      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { balanceLoading: false, getBalanceError: true } })
      console.log(`account formate error: ${address}`)
    }
  },

  transferEther: (address, to, ether, privateKey) => {
    FaxTokenImAPI.transferEther(address, to, ether, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { transEtherLoading: false } })
      showNotification('transactionDone', 'info', formatMessage({ id: 'transaction_send_notice' }));
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`transfer ether from ${address} to ${to} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { transEtherLoading: false, transEtherError: true } })
    })
  },

  transferFax: (address, to, fax, privateKey) => {
    FaxTokenImAPI.transfer(address, to, fax, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { transFaxLoading: false } })
      showNotification('transFax', 'success', formatMessage({ id: 'transaction_success_notice' }));
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`transfer token from ${address} to ${to} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { transFaxLoading: false, transFaxError: true } })
    })
  },

  buyFax: (address, faxNumber, value, privateKey) => {
    FaxTokenImAPI.buyFax(address, faxNumber, value, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { transFaxLoading: false } })
      showNotification('buyFax', 'success', `${formatMessage({ id: 'success_buy' })}${faxNumber}个FAX`);
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`buy ${faxNumber} Fax token for ${address} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { buyFaxLoading: false, buyFaxError: true } })
    })
  },

  approve: (address, contract, faxNumber, privateKey) => {
    FaxTokenImAPI.approve(address, contract, faxNumber, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { approveLoading: false } })
      showNotification('approve', 'success', formatMessage({ id: 'approve_success' }));
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`approve from ${address} to ${contract} , fax ${faxNumber} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { approveLoading: false, approveError: true } })
    })
  },

  sendShhMessage: (pubKey, message, id) => {
    FaxTokenImAPI.sendShhMessageToPubKey({ pubKey, message }).then(() => {
      window.g_app._store.dispatch({ type: 'user/shhMessageSendSuccess', payload: id })
    }).catch(() => {
      window.g_app._store.dispatch({ type: 'user/shhMessageSendFail', payload: id })
    })
  },

  sendShhSymMessage: (symKeyID, message, id) => {
    FaxTokenImAPI.sendSymMessage({ symKeyID, message }).then(() => {
      window.g_app._store.dispatch({ type: 'user/shhMessageSendSuccess', payload: id })
    }).catch(() => {
      window.g_app._store.dispatch({ type: 'user/shhMessageSendFail', payload: id })
    })
  },

  sendMessage: (address, to, message, privateKey) => {
    FaxTokenImAPI.sendMessageByContract(address, to, message, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { messageSendLoading: false } })
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`send message from ${address} to ${to} , message ${message} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { messageSendLoading: false, messageSendError: true } })
    })
  },

  saveImageToSwarmCreateDirectory: ({ to, shhPubKey, group }, fileName, formData) => {
    fetch(`${IMApp.SWARM_URL}/bzz:/`, {
      method: 'POST',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    }).then(res => res.text()).then((hash) => {
      if (group) {
        window.g_app._store.dispatch({ type: 'user/sendGroupImageMessage', payload: { fileName, fileHash: hash } })
      } else {
        window.g_app._store.dispatch({ type: 'user/sendImageMessage', payload: { to, shhPubKey, fileName, fileHash: hash } })
      }
    }).catch(console.log)
  },

  checkRegisterReward: (address) => {
    FaxTokenImAPI.registedReward(address).then((reward) => {
      const rewardDecimal = FaxTokenImAPI.web3.utils.toNumber(reward);
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { registerRewardLoading: false, registerReward: rewardDecimal } })
    }).catch((err) => {
      console.log(`query ${address} register reward error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { registerRewardLoading: false } })
    })
  },

  checkLoginReward: (address) => {
    const now = new Date();
    const dayCount = Math.floor(now.getTime() / 1000 / 86400);
    FaxTokenImAPI.loginReward(dayCount, address).then((reward) => {
      const rewardDecimal = FaxTokenImAPI.web3.utils.toNumber(reward);
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { loginRewardLoading: false, loginReward: rewardDecimal } })
    }).catch((err) => {
      console.log(`query ${address} login reward at day ${dayCount} error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { loginRewardLoading: false } })
    })
  },

  getRegisterReward: (address, privateKey) => {
    FaxTokenImAPI.getRegistedReward(address, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { registerRewardLoading: false, registerReward: 20 } })
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`get ${address} Register Reward Failed`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { registerRewardLoading: false, getResigerRewardError: true } })
    })
  },

  getLoginReward: (address, privateKey) => {
    FaxTokenImAPI.getLoginReward(address, privateKey).then((tx) => {
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { loginRewardLoading: false, loginReward: 5 } })
      window.g_app._store.dispatch({ type: 'user/getBalance' })
    }).catch((err) => {
      console.log(`get ${address} Login Reward Failed`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'user/saveUserState', payload: { loginRewardLoading: false, getloginRewardError: true } })
    })
  },

  queryAccountBalance: (address) => {
    FaxTokenImAPI.queryAccountBalance(address).then(({ tokenDecimal, etherDecimal }) => {
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { accountBalancLoading: false, accountEther: etherDecimal, accountToken: tokenDecimal } })
    }).catch((err) => {
      console.log(`get ${address} balance error`)
      console.log(err)
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { accountBalancLoading: false, queryAccountBalanceError: true } })
    })
  },

  queryAccountBalanceByENS: (name) => {
    if (name && /^[a-zA-Z0-9]*$/.test(name)) {
      const faxname = `${name}.fax`;
      window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryName: faxname } })
      FaxTokenImAPI.getENSAddressByName(faxname).then((address) => {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryAccount: address, queryName: faxname } })
        IMApp.queryAccountBalance(address);
      }).catch((err) => {
        console.log(`get ens ${faxname} address error`)
        console.log(err)
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { ensError: err, accountBalancLoading: false } })
      })
    } else {
      FaxTokenImAPI.getENSAddressByName(name).then((address) => {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { queryAccount: address } })
        IMApp.queryAccountBalance(address);
      }).catch((err) => {
        window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { ensError: err, accountBalancLoading: false } })
      })
    }
  },

  getTokenContractStatus: () => {
    FaxTokenImAPI.tokenContractInfo().then((tokenContractInfo) => {
      const { address, owner, name, symbol, standard, totalSupply, ownerBalance, } = tokenContractInfo;
      window.g_app._store.dispatch({
        type: 'contract/saveContractState', payload: {
          tokenContractLoading: false,
          tokenAddress: address,
          tokenOwner: owner,
          tokenName: name,
          tokenSymbol: symbol,
          tokenStandard: standard,
          tokenTotalSupply: totalSupply,
          tokenOwnerBalance: ownerBalance,
        }
      })
    }).catch((err) => {
      console.log(`Get tokenContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { tokenContractLoading: false, tokenContractError: true } })
    })

  },

  getIMContractStatus: () => {
    FaxTokenImAPI.imContractInfo().then((imContractInfo) => {
      const { address, owner, tokenAdmin, rewards, allowance, messageCount } = imContractInfo;
      window.g_app._store.dispatch({
        type: 'contract/saveContractState', payload: {
          imContractLoading: false,
          imAddress: address,
          imOwner: owner,
          imTokenAdmin: tokenAdmin,
          imRewards: rewards,
          imAllowance: allowance,
          imMessageCount: messageCount,
        }
      })
    }).catch((err) => {
      console.log(`Get imContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { imContractLoading: false, imContractError: true } })
    })
  },

  getSaleContractStatus: () => {
    FaxTokenImAPI.saleContractInfo().then((saleContractInfo) => {
      const { address, owner, tokenAdmin, tokenPrice, tokensSold, allowance, contractEther } = saleContractInfo
      window.g_app._store.dispatch({
        type: 'contract/saveContractState', payload: {
          saleContractLoading: false,
          saleAddress: address,
          saleOwner: owner,
          saleTokenAdmin: tokenAdmin,
          saleTokenPrice: tokenPrice,
          saleTokenSold: tokensSold,
          saleAllownce: allowance,
          saleContractEther: contractEther,
        }
      })
    }).catch((err) => {
      console.log(`Get saleContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { saleContractLoading: false, saleContractError: true } })
    })
  },

  getENSContractStatus: () => {
    FaxTokenImAPI.ensContractInfo().then((ensContract) => {
      const { ensAddress, ensOwner } = ensContract;
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { ensContractLoading: false, ensAddress, ensOwner } })
    }).catch((err) => {
      console.log(`Get ensContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { ensContractLoading: false, ensContractError: true } })
    })
  },

  getFaxDomainContractStatus: () => {
    FaxTokenImAPI.faxDomainContractInfo().then((faxDomainInfo) => {
      const { faxDomainAddress, faxDomainOwner, faxDomainResolver } = faxDomainInfo;
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { faxDomainContractLoading: false, faxDomainAddress, faxDomainOwner, faxDomainResolver } })
    }).catch((err) => {
      console.log(`Get faxDomainContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { faxDomainContractLoading: false, faxDomainContractError: true } })
    })
  },

  getResolverContractStatus: () => {
    FaxTokenImAPI.resolverContractInfo().then((resolverInfo) => {
      const { resolverAddress, resolverOwner } = resolverInfo;
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { resolverContractLoading: false, resolverAddress, resolverOwner } })
    }).catch((err) => {
      console.log(`Get faxDomainContract Info error`);
      console.log(err);
      window.g_app._store.dispatch({ type: 'contract/saveContractState', payload: { resolverContractLoading: false, resolverContractError: true } })
    })
  },

}

export default IMApp;
