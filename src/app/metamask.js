import { getLocalShhKeyPair, showNotification } from '@/app/util';
import { FaxTokenImAPI } from '@/app/api';
import { message } from 'antd';
import accountType from '@/app/accountType';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';


function isMetamask() {
  return !!window.ethereum && window.ethereum.isMetaMask;
}

export function selectedAddress() {
  if (isMetamask()) {
    return window.ethereum.selectedAddress;
  }
  return undefined;
}

export async function connectMetamask() {
  if (!isMetamask()) {
    return false;
  }

  try {
    try {
      if (window.ethereum.chainId!='0x4')
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
                       rpcUrls: ['https://app.beagledao.finance/eth'],
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

    if (window.App.messageFilter) {
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
    showNotification('connect_metamask', 'success');

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
      nonce: window.FaxTokenImAPI.web3.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from,
      to,
      value: window.FaxTokenImAPI.web3.toHex(value),
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

export async function newSubdomain(name,domain,tld) {
  const nonce = await FaxTokenImAPI.getWalletTransactionCount(window.ethereum.selectedAddress);
  const data = FaxTokenImAPI.web3EnsSubdomainFactory.newSubdomain.getData(name,domain,tld,window.ethereum.selectedAddress,window.ethereum.selectedAddress);
  const param = {
    nonce: FaxTokenImAPI.web3.toHex(nonce+1),
    gas: '0x33450', // 210000
      gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    from: window.ethereum.selectedAddress,
    to: FaxTokenImAPI.web3EnsSubdomainFactory.address,
    value: '0x0',
    data,
    chainId: window.ethereum.chainId,
  };
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [param],
  });
  console.log(`newSubdomain hash: ${txHash} nonce:${nonce}`);
  const provider = await detectEthereumProvider();

  if (provider) {
    // From now on, this should always be true:
    // provider === window.ethereum
//        startApp(provider); // initialize your app
    FaxTokenImAPI.web3wallet.setProvider(provider);
  } else {
    console.log('Please install MetaMask!');
  }
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
    alert(`ERROR:newSubdomain ${name}.beagles.eth is not registered`)
  return;
}

export async function reverseRegister(name) {
  const nonce = await FaxTokenImAPI.getWalletTransactionCount(window.ethereum.selectedAddress);
  const data = FaxTokenImAPI.web3EnsReverseRegistrar.setName.getData(name);
  const param = {
    nonce: FaxTokenImAPI.web3.toHex(nonce+1),
    gas: '0x33450', // 210000
      gasPrice: '0x77359400', //2,000,000,000
    //gasPrice:'0x59682f00',//1,500,000,000
    from: window.ethereum.selectedAddress,
    to: FaxTokenImAPI.web3EnsReverseRegistrar.address,
    value: '0x0',
    data,
    chainId: window.ethereum.chainId,
  };
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [param],
  });
  console.log(`setName hash: ${txHash} nonce:${nonce}`);
 const provider = await detectEthereumProvider();

  if (provider) {
    // From now on, this should always be true:
    // provider === window.ethereum
//        startApp(provider); // initialize your app
    FaxTokenImAPI.web3wallet.setProvider(provider);
  } else {
    console.log('Please install MetaMask!');
  }
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
    alert(`ERROR:newSubdomain ${name}.beagles.eth is not registered`)
  return;
}

export async function saveShhName(name) {
  try {
    if (window.ethereum.chainId==4){
        return newSubdomain(name,'beagles','eth');
    }
    const nonce = await FaxTokenImAPI.getTransactionCount(window.ethereum.selectedAddress);
    const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
    const param = {
      nonce: window.FaxTokenImAPI.web3.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from: window.ethereum.selectedAddress,
      to: FaxTokenImAPI.shhDataContract.address,
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
