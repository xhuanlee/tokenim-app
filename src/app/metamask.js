import { getLocalShhKeyPair, showNotification } from '@/app/util';
import { FaxTokenImAPI } from '@/app/api';
import { message } from 'antd';

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
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { auth: true, loginEns, loginAddress: address, address, visitorMode: false } });
    window.g_app._store.dispatch({ type: 'user/readChatHistory' });
    window.g_app._store.dispatch({ type: 'user/getBalance' });
    window.g_app._store.dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
    showNotification('connect_metamask', 'success');

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
      nonce: window.web3.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from,
      to,
      value: window.web3.toHex(value),
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

export async function saveShhName(name) {
  try {
    const nonce = await FaxTokenImAPI.getTransactionCount(window.ethereum.selectedAddress);
    const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
    const param = {
      nonce: window.web3.toHex(nonce),
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
