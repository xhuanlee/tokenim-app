import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { getLocalShhKeyPair, showNotification } from '@/app/util';
import { FaxTokenImAPI } from '@/app/api';
import {IMApp} from '@/app/index';
import accountType from '@/app/accountType';
import { selectedAddress } from '@/app/metamask';

export async function loginWalletConnect(connector,address) {
  try {
//      const address = selectedAddress();
    window.App.loginAddress = address;
    window.App.connector = connector;
    await FaxTokenImAPI.initialWalletConnect(connector);
    address = window.App.provider.accounts[0];
    /* liwei
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
    */
    let loginEns = await FaxTokenImAPI.getShhNameByAddress(address);
    if (!loginEns) {
      loginEns = `${address.substring(0,5)}...${address.substring(address.length - 5)}`;
    }
    window.g_app._store.dispatch({ type: 'account/saveAccountType', payload: { accountType: accountType.metamask } });
    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { auth: true, loginEns, loginAddress: address, address, visitorMode: false } });
    window.g_app._store.dispatch({ type: 'user/readChatHistory' });
    window.g_app._store.dispatch({ type: 'user/getBalance' });
    window.g_app._store.dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
    showNotification('connect_walletconnect', 'success');


    // should get free 1 Ether to new account
    // IMApp.getFreeEther(address).then(() => {
    //   console.log('success get ether')
    // });

    return true;
  } catch (e) {
    console.error('connect WalletConnect error: ', e);
    showNotification('connect_walletconnect', 'error');
  }
  return false;
}

export async function connectWallectConnect() {
// Create a connector
  return await loginWalletConnect(null,null);
  const connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org", // Required
    qrcodeModal: QRCodeModal,
  });

// Check if connection is already established
  if (!connector.connected) {
    // create new session
    connector.createSession();
  }
  else
    // if (connector.chainId!=4){
    //     alert(`Not Support ${connector.chainId}`)
    //     connector.killSession();
    // }
    // else
    if (connector.accounts.length>0)
      return loginWalletConnect(connector,connector.accounts[0]);

  return new Promise(resolve => {
// Subscribe to connection events
    connector.on("connect", async (error, payload) => {
      if (error) {
        throw error;
      }
      if (connector.chainId!=4){
        alert(`Not Support ${connector.chainId}, you need switch to supported chain to do transaction`)
//      connector.killSession();
      }
      // Close QR Code Modal
      QRCodeModal.close();
      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(JSON.stringify(accounts),chainId);
      resolve(loginWalletConnect(connector,accounts[0]));
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(JSON.stringify(accounts),chainId);
      loginWalletConnect(connector,accounts[0]);
      resolve(true);
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log(error,JSON.stringify(payload));
      // Delete connector
      resolve(false);
    });

  })
}
