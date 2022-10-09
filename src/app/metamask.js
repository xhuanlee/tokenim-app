import { getLocalShhKeyPair, showNotification } from '@/app/util';
import { FaxTokenImAPI } from '@/app/api';
import { message } from 'antd';
import accountType from '@/app/accountType';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';
import IMApp from './index';
//const namehash = require('eth-ens-namehash');
import namehash from 'eth-ens-namehash';


function isMetamask() {
  return !!window.ethereum && window.ethereum.isMetaMask;
}

export function selectedAddress() {
  if (isMetamask()) {
    return window.ethereum.selectedAddress;
  }
  return undefined;
}

export async function switchToChainId(chainid) {
  if (!isMetamask()) {
    return false;
  }

    try {
      if (window.ethereum.chainId!=chainid)
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainid }],
        });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
        console.log("network error:" + JSON.stringify(switchError))
        alert("switch network error:" + switchError.code)
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = selectedAddress();

  }

  export function isSupportedNatwork() {
    if (window.ethereum.chainId!='0x4'
      && window.ethereum.chainId!='0x5eb'
        && window.ethereum.chainId!='0x1'
        && window.ethereum.chainId!='0x5')
      return false;
    else
      return true;
  }
export async function connectMetamask() {
  if (!isMetamask()) {
    return false;
  }

  try {
    try {
      if (!isSupportedNatwork())
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5eb' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902 || switchError.code === 4001) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x5eb',
                        chainName: 'BeagleDAO App Chain',
                        nativeCurrency: {
                          name: 'beagledao',
                          symbol: 'bETH',
                          decimals: 18
                        },
                       rpcUrls: ['https://beagle.chat/eth'],
                       // blockExplorerUrls: ['https://beagledao.finance/']
                    /* ... */ }],
          });
        } catch (addError) {
          // handle "add" error
          console.log("add network error:" + JSON.stringify(addError))
          alert("add network error:" + addError.code)
        }
      }
      else {
        console.log("network error:" + JSON.stringify(switchError))
        alert("switch network error:" + switchError.code)
      }
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = selectedAddress();
    window.App.loginAddress = address;
    let keypair = getLocalShhKeyPair(address);
    console.log(`local shh: ${JSON.stringify(keypair)}`);
    if (!keypair || !keypair.id) {
      try {
        const pubKey = await FaxTokenImAPI.getShhPublicKeyByAddress(address);
        const priKey = await FaxTokenImAPI.getShhPrivateKeyByAddress(address);
        const id = await FaxTokenImAPI.importShhPrivateKey(priKey);
        keypair = { id, priKey, pubKey };
        console.log(`contract shh: ${JSON.stringify(keypair)}`);
      } catch (e) {
        console.error('get contract shh error: ', e);
      }
    }

    if (!keypair || !keypair.id) {
      // new shh key pair
      const id = await FaxTokenImAPI.newShhKeypair();
      const shhPk = await FaxTokenImAPI.getShhPrivateKeyById(id);
      const shhPub = await FaxTokenImAPI.getShhPublicKeyById(id);
      const { priKey } = shhPk;
      const { pubKey } = shhPub;
      keypair = { id, priKey, pubKey };
      await window.App.saveShhKeypair(address, keypair);
      console.log(`new shh: ${JSON.stringify(keypair)}`);
    }
    if (keypair && keypair.id) {
      window.App.saveShhKeypairToLocal(address, keypair);
    }

    if (window.App.messageFilter && window.App.messageFilter.stopWatching) {
      window.App.messageFilter.stopWatching(window.App.newMessageArrive);
    }
    window.App.messageFilter = FaxTokenImAPI.setupShhMessageListener(keypair.id, window.App.newMessageArrive);
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { shhKeyId: keypair.id, shhPubKey: keypair.pubKey, shhPriKey: keypair.priKey, shhKeyAvaiable: true } });
    window.App.getShhSymKey();

    FaxTokenImAPI.setupNewTransactionListener(address, (filter) => { window.App.transactionFilter = filter }, window.App.newTransactionArrive);
    let loginEns = await FaxTokenImAPI.getShhNameByAddress(address);
    if (!loginEns) {
      loginEns = `${address.substring(0,5)}...${address.substring(address.length - 5)}`;
    }
    window.g_app._store.dispatch({ type: 'account/saveAccountType', payload: { accountType: accountType.metamask } });
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { auth: true, loginEns, loginAddress: address, address, visitorMode: false } });
    window.g_app._store.dispatch({ type: 'user/readChatHistory' });
    window.g_app._store.dispatch({ type: 'user/getBalance' });
    window.g_app._store.dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
    showNotification('connect_metamask', ' success');

    // should get free 1 Ether to new account
    // IMApp.getFreeEther(address).then(() => {
    //   console.log('success get ether')
    // });

    return true;
  } catch (e) {
    console.error('connect metamask error: ', e);
    showNotification('connect_metamask', 'error');
  }

  return false;
}

export async function transferEther(from ,to, value) {
  try {
    const nonce = await FaxTokenImAPI.getTransactionCount(from);
    const param = {
      nonce: window.FaxTokenImAPI.web3.utils.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from,
      to,
      value: window.FaxTokenImAPI.web3.utils.toHex(value),
      chainId: window.ethereum.chainId,
    };
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [param],
    });
    console.log(`transfer hash: ${txHash}`);
    showNotification('transfer', 'success');
  } catch (e) {
    console.error('transfer ether error: ', e);
    showNotification('transfer', 'error');
  }

}

export async function signText(from ,text) {
  try {
    const provider = await detectEthereumProvider();
    return new Promise((resolve,reject )=> {
      try {
        const web3 = new Web3(window.ethereum);
        web3.eth.personal.sign(text, from, function (err, result) {
//       web3.eth.sign(web3.utils.asciiToHex(text), from, function (err, result) {
          if (err) return console.error(err)
          console.log('SIGNED:' + result);
          resolve(result);
        })

      } catch (err) {
        if (err) return console.error(err)
        reject(null);
      }
    });
    const nonce = await FaxTokenImAPI.getTransactionCount(from);
    const param = {
      // nonce: window.FaxTokenImAPI.web3.utils.toHex(nonce),
      // gas: '0x15f90',
      // gasPrice: '0x4a817c800',
      from,
      text
      // to,
      // value: window.FaxTokenImAPI.web3.utils.toHex(text),
      // chainId: window.ethereum.chainId,
    };
    const txHash = await window.ethereum.request({
      method: 'personal_sign',
      params: [param],
    });
    console.log(`eth_sign hash: ${txHash}`);
    showNotification('eth_sign', 'success');
    return txHash;
  } catch (e) {
    console.error('transfer ether error: ', e);
    showNotification('eth_sign', 'error');
  }

}

export async function newSubdomain(name,domain,tld) {
//  FaxTokenImAPI.initialWalletConnect(window.App.connector);
  let selectedAddress,chainId,data,gas;
  if (window.App.connector) {
    selectedAddress = window.App.connector.accounts[0];
    chainId = window.App.connector.chainId;
//  data = await FaxTokenImAPI.web3EnsSubdomainFactory.newSubdomain.getData(name,domain,tld,selectedAddress,selectedAddress);
    data = await FaxTokenImAPI.web3EnsSubdomainFactory.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).encodeABI();
    gas = await FaxTokenImAPI.web3EnsSubdomainFactory.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).estimateGas();
    //                var textNickname = resolver.contract.methods.setText(mynode, "nickname", names[i]+' is me').encodeABI();
//    data = FaxTokenImAPI.web3EnsSubdomainFactory.contract.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).encodeABI();
//    gas = FaxTokenImAPI.web3EnsSubdomainFactory.contract.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).estimateGas();
  }
  else{
    selectedAddress = window.ethereum.selectedAddress;
    chainId=window.ethereum.chainId;
//    data = FaxTokenImAPI.web3EnsSubdomainFactory.newSubdomain.getData(name,domain,tld,selectedAddress,selectedAddress);
    data = await FaxTokenImAPI.web3EnsSubdomainFactory.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).encodeABI();
    gas = await FaxTokenImAPI.web3EnsSubdomainFactory.methods.newSubdomain(name,domain,tld,selectedAddress,selectedAddress).estimateGas();
  }
  let nonce = await FaxTokenImAPI.getWalletTransactionCount(selectedAddress);
  console.log(`${nonce} addr:${selectedAddress},chainId:${chainId},data:${data},gas:${gas}`);
  // if (nonce<27)
  //   nonce=27;
  const param = {
    from: selectedAddress,
    to: FaxTokenImAPI.web3EnsSubdomainFactory._address,
    nonce: FaxTokenImAPI.web3wallet.utils.toHex(nonce),
    gas: '0x33450', // 210000
  //  gas: FaxTokenImAPI.web3wallet.utils.toHex(gas),
    //gas: '0x64190', // 410000
//    gas: '0x94ed0', //6100
     // gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    gasPrice:'0x09502f9000',
    value: '0x0',
    data,
    chainId: chainId,
  };
  console.log(JSON.stringify(param));
  // {"from":"0x60FEaA140bdB9282288E7809abA94b9A594b456b","to":"0xEE29d4293A2a701478fB930DEe29d56b8F53B115","nonce":"0x04","gasPrice":"0x09502f9000","gasLimit":"0x5208","value":"0x00","data":"0xbeea7bfb00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000060feaa140bdb9282288e7809aba94b9a594b456b00000000000000000000000060feaa140bdb9282288e7809aba94b9a594b456b000000000000000000000000000000000000000000000000000000000000000678787878787800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007626561676c65730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036574680000000000000000000000000000000000000000000000000000000000"}
  let txHash;
  if (window.App.connector){
    //Draft Custom Request
    const customRequest = {
      id: 1337,
      jsonrpc: "2.0",
//      method: "eth_signTransaction",
      method: "eth_sendTransaction",
      params: [
        param,
      ],
    };
//    txHash = await window.App.provider.request(customRequest);
//   txHash = await window.App.connector.sendCustomRequest(customRequest);
    // Send Transaction
    function sendTransaction(_tx) {
      return new Promise((resolve, reject) => {
        FaxTokenImAPI.web3wallet.eth
          .sendTransaction(_tx)
          .once("transactionHash", (txHash) => resolve(txHash))
          .catch((err) => reject(err));
      });
    }
    txHash = await  FaxTokenImAPI.web3wallet.eth.sendTransaction(param);
    // txHash = await sendTransaction(param);
//    txHash = await window.App.connector.sendTransaction(param);
//    txHash = await window.App.connector.signTransaction(param);
  }
  else
   txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [param],
  });
  console.log(`newSubdomain hash: ${txHash} nonce:${nonce}`);
//   const provider = await detectEthereumProvider();
//
//   if (provider) {
//     // From now on, this should always be true:
//     // provider === window.ethereum
// //        startApp(provider); // initialize your app
//     FaxTokenImAPI.web3wallet.setProvider(provider);
//   } else {
//     console.log('Please install MetaMask!');
//   }
  if (txHash && txHash.length>0)
    FaxTokenImAPI.web3wallet.eth.getTransactionReceipt(txHash, async function  (e, data) {
      if (e !== null) {
        alert("Could not find a transaction for your id! ID you provided was " + txHash);
        console.log("Could not find a transaction for your id! ID you provided was " + txHash);
      } else {
        console.log(data);
        if (data && data.status == '0x0') {
          console.log("The contract execution was not successful, check your transaction !");
          alert("The contract execution was not successful, check your transaction !");
        } else {
          console.log(`newSubdomain ${name}.beagles.eth registered`);
          await reverseRegister(`${name}.beagles.eth`);
          window.g_app._store.dispatch({
            type: 'account/saveAccountState',
            payload: { loginEns: `${name}.beagles.eth` }
          });
        }
      }});
  else
    if (txHash && txHash.status && txHash.blockHash){
      console.log(`newSubdomain ${name}.beagles.eth registered`);
      await reverseRegister(`${name}.beagles.eth`);
      window.g_app._store.dispatch({
        type: 'account/saveAccountState',
        payload: { loginEns: `${name}.beagles.eth` }
      });
    }
    else
      alert(`ERROR:newSubdomain ${name}.beagles.eth is not registered`)
  return;
}

export async function reverseRegister(name) {
  let selectedAddress,chainId;
  if (window.App.connector) {
    selectedAddress = window.App.connector.accounts[0];
    chainId = window.App.connector.chainId;
  }
  else{
    selectedAddress = window.ethereum.selectedAddress;
    chainId=window.ethereum.chainId;
  }
  let nonce = await FaxTokenImAPI.getWalletTransactionCount(selectedAddress);
//  const data = FaxTokenImAPI.web3EnsReverseRegistrar.setName.getData(name);
  const gas = FaxTokenImAPI.web3EnsReverseRegistrar.methods.setName(name).estimateGas();
  const data = FaxTokenImAPI.web3EnsReverseRegistrar.methods.setName(name).encodeABI();
  console.log(`${nonce} addr:${selectedAddress},chainId:${chainId},gas:${gas}`);
  // if (nonce<28)
  //   nonce=28;
  const param = {
    nonce: FaxTokenImAPI.web3wallet.utils.toHex(nonce),
    gas: '0x33450', // 210000
//    gas: '0x64190', // 410000
//    gas: FaxTokenImAPI.web3wallet.utils.toHex(gas),
//    gas: '0x94ed0', //6100
    gasPrice:'0x09502f9000',
//      gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    from: selectedAddress,
    to: FaxTokenImAPI.web3EnsReverseRegistrar._address,
    value: '0x0',
    data,
    chainId: chainId,
  };
  let txHash;
  console.log(JSON.stringify(param));
  if (window.App.connector){
    // Draft Custom Request
    // const customRequest = {
    //   id: 1337,
    //   jsonrpc: "2.0",
    //   method: "eth_signTransaction",
    //   params: [
    //     param,
    //   ],
    // };
//    txHash = await window.App.connector.sendCustomRequest(customRequest);
    txHash = await FaxTokenImAPI.web3wallet.eth.sendTransaction(param);
//    txHash = await window.App.connector.sendTransaction(param);
//    txHash = await window.App.connector.signTransaction(param);

  }
  else
    txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [param],
  });
  console.log(`setName hash: ${txHash} nonce:${nonce}`);
//  const provider = await detectEthereumProvider();
//
//   if (provider) {
//     // From now on, this should always be true:
//     // provider === window.ethereum
// //        startApp(provider); // initialize your app
//     FaxTokenImAPI.web3wallet.setProvider(provider);
//   } else {
//     console.log('Please install MetaMask!');
//   }
  if (txHash && txHash.length>0)
    FaxTokenImAPI.web3wallet.eth.getTransactionReceipt(txHash, function (e, data) {
      if (e !== null) {
        alert("Could not find a transaction for your id! ID you provided was " + txHash);
        console.log("Could not find a transaction for your id! ID you provided was " + txHash);
      } else {
        console.log(data);
        if (data && data.status == '0x0') {
          console.log("The contract execution was not successful, check your transaction !");
          alert("The contract execution was not successful, check your transaction !");
        } else {
          console.log(`setName ${name}.beagles.eth registered`);
          alert(`setName ${name} from ${window.ethereum.selectedAddress}`);
          // window.g_app._store.dispatch({
          //   type: 'account/saveAccountState',
          //   payload: { loginEns: `${name}.beagles.eth` }
          // });
        }
      }});
  else
    alert(`ERROR:setName ${name}.beagles.eth failed`)
  return;
}

export async function getLoginReward(address) {
  let selectedAddress,chainId;
  if (window.App.connector) {
    selectedAddress = window.App.connector.accounts[0];
    chainId = window.App.connector.chainId;
  }
  else{
    selectedAddress = window.ethereum.selectedAddress;
    chainId=window.ethereum.chainId;
  }
  let nonce = await FaxTokenImAPI.getWalletTransactionCount(selectedAddress);
//  const data = FaxTokenImAPI.web3EnsReverseRegistrar.setName.getData(name);
  const gas = FaxTokenImAPI.web3ImContract.methods.getLoginReward().estimateGas();
  const data = FaxTokenImAPI.web3ImContract.methods.getLoginReward().encodeABI();

  console.log(`${nonce} addr:${selectedAddress},chainId:${chainId},gas:${gas}`);
  // if (nonce<28)
  //   nonce=28;
  const param = {
    nonce: FaxTokenImAPI.web3.utils.toHex(nonce),
    gas: '0x33450', // 210000
//    gas: '0x64190', // 410000
//    gas: FaxTokenImAPI.web3wallet.utils.toHex(gas),
//    gas: '0x94ed0', //6100
    gasPrice:'0x09502f9000',
//      gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    from: selectedAddress,
    to: FaxTokenImAPI.web3ImContract._address,
    value: '0x0',
    data,
    chainId: chainId,
  };
  let txHash;
  console.log(JSON.stringify(param));
  if (window.App.connector){
    txHash = await FaxTokenImAPI.web3.eth.sendTransaction(param);
  }
  else
    txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [param],
    });
  console.log(`getLoginReward hash: ${txHash} nonce:${nonce}`);
//  const provider = await detectEthereumProvider();
//
//   if (provider) {
//     // From now on, this should always be true:
//     // provider === window.ethereum
// //        startApp(provider); // initialize your app
//     FaxTokenImAPI.web3wallet.setProvider(provider);
//   } else {
//     console.log('Please install MetaMask!');
//   }
  if (txHash && txHash.length>0)
    FaxTokenImAPI.web3.eth.getTransactionReceipt(txHash, function (e, data) {
      if (e !== null) {
        alert("Could not find a transaction for your id! ID you provided was " + txHash);
        console.log("Could not find a transaction for your id! ID you provided was " + txHash);
      } else {
        console.log(data);
        if (data && data.status == '0x0') {
          console.log("The contract execution was not successful, check your transaction !");
          alert("The contract execution was not successful, check your transaction !");
        } else {
          console.log(`getLoginReward ${address} `);
          alert(`getLoginReward ${address} from ${window.ethereum.selectedAddress}`);
        }
      }});
  else
    alert(`ERROR:getLoginReward ${address}.beagles.eth is not registered`)
  return;
}

export async function getNameText(name,key) {
  console.log(`${name}.${key}`);
  let nameNode = namehash.hash(name);
  console.log(`${name}.${key}:${nameNode}`);
  let value = await FaxTokenImAPI.web3EnsResolver.methods.text(nameNode,key).call();
  console.log(`${name}.${key} is ${value}`);
  return value;
}
export async function publishName(name,shhPubKey) {
  let nameNode = namehash.hash(name);
  let shhPubKeyOld = await FaxTokenImAPI.web3EnsResolver.methods.text(nameNode,'whisper').call();

  if (shhPubKey==shhPubKeyOld){
    console.log(`${name} whisper nt changed:${shhPubKeyOld}`);
    return;
  }
  if (window.ethereum.chainId!='0x4')
    await switchToChainId('0x4');

  let selectedAddress,chainId;
  if (window.App.connector) {
    selectedAddress = window.App.connector.accounts[0];
    chainId = window.App.connector.chainId;
  }
  else{
    selectedAddress = window.ethereum.selectedAddress;
    chainId=window.ethereum.chainId;
  }
  let nonce = await FaxTokenImAPI.getWalletTransactionCount(selectedAddress);
//  const data = FaxTokenImAPI.web3EnsReverseRegistrar.setName.getData(name);
  const gas = FaxTokenImAPI.web3EnsResolver.methods.setText(nameNode,'whisper',shhPubKey).estimateGas();
  const data = FaxTokenImAPI.web3EnsResolver.methods.setText(nameNode,'whisper',shhPubKey).encodeABI();
  console.log(`${nonce} addr:${selectedAddress},chainId:${chainId},gas:${gas}`);
  // if (nonce<28)
  //   nonce=28;
  const param = {
    nonce: FaxTokenImAPI.web3wallet.utils.toHex(nonce),
    gas: '0x33450', // 210000
//    gas: '0x64190', // 410000
//    gas: FaxTokenImAPI.web3wallet.utils.toHex(gas),
//    gas: '0x94ed0', //6100
    gasPrice:'0x09502f9000',
//      gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    from: selectedAddress,
    to: FaxTokenImAPI.web3EnsResolver._address,
    value: '0x0',
    data,
    chainId: chainId,
  };
  let txHash;
  console.log(JSON.stringify(param));
  if (window.App.connector){
    // Draft Custom Request
    // const customRequest = {
    //   id: 1337,
    //   jsonrpc: "2.0",
    //   method: "eth_signTransaction",
    //   params: [
    //     param,
    //   ],
    // };
//    txHash = await window.App.connector.sendCustomRequest(customRequest);
    txHash = await FaxTokenImAPI.web3wallet.eth.sendTransaction(param);
//    txHash = await window.App.connector.sendTransaction(param);
//    txHash = await window.App.connector.signTransaction(param);

  }
  else
    txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [param],
    });
  console.log(`setName hash: ${txHash} nonce:${nonce}`);
//  const provider = await detectEthereumProvider();
//
//   if (provider) {
//     // From now on, this should always be true:
//     // provider === window.ethereum
// //        startApp(provider); // initialize your app
//     FaxTokenImAPI.web3wallet.setProvider(provider);
//   } else {
//     console.log('Please install MetaMask!');
//   }
  if (txHash && txHash.length>0)
    FaxTokenImAPI.web3wallet.eth.getTransactionReceipt(txHash, function (e, data) {
      if (e !== null) {
        alert("Could not find a transaction for your id! ID you provided was " + txHash);
        console.log("Could not find a transaction for your id! ID you provided was " + txHash);
      } else {
        console.log(data);
        if (data && data.status == '0x0') {
          console.log("The contract execution was not successful, check your transaction !");
          alert("The contract execution was not successful, check your transaction !");
        } else {
          console.log(`setText ${name}.beagles.eth registered`);
          alert(`setText ${name} whisper public key to ${shhPubKey} from ${window.ethereum.selectedAddress}`);
          // window.g_app._store.dispatch({
          //   type: 'account/saveAccountState',
          //   payload: { loginEns: `${name}.beagles.eth` }
          // });
        }
      }});
  else
    alert(`ERROR:setText ${name}.beagles.eth failed`)
  return;
}

export async function saveShhName(name) {
  try {
    if (window.ethereum.chainId!='0x4')
      await switchToChainId('0x4');
    if (window.ethereum.chainId==4 || window.ethereum.chainId=='0x4' || window.App.connector){
        return newSubdomain(name,'beagles','eth');
    }
    const nonce = await FaxTokenImAPI.getTransactionCount(window.ethereum.selectedAddress);
    // const gas = FaxTokenImAPI.web3EnsReverseRegistrar.methods.setName(name).estimateGas();
    // const data = FaxTokenImAPI.web3EnsReverseRegistrar.methods.setName(name).encodeABI();
//    const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
    const data = FaxTokenImAPI.web3ShhDataContract.methods.saveShhName(name).encodeABI();
    const param = {
      nonce: window.FaxTokenImAPI.web3.utils.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from: window.ethereum.selectedAddress,
      to: FaxTokenImAPI.shhDataContract._address,
      value: '0x0',
      data,
      chainId: window.ethereum.chainId,
    };
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [param],
    });
    console.log(`save shh name hash: ${txHash}`);

    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { loginEns: name } });
  } catch (e) {
    message.error('save shh name error!');
  }
}
