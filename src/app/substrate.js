import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { stringToHex, hexToString } from '@polkadot/util';

import { getLocalShhKeyPair, showNotification } from '@/app/util';
import { FaxTokenImAPI } from '@/app/api';
import { message } from 'antd';
import accountType from '@/app/accountType';
import IMApp from '@/app/index';

export async function connectSubstrate() {
  try {
    window.stringToHex = stringToHex;
    window.hexToString = hexToString;
    await web3Enable('club');
    const allAccounts = await web3Accounts();

    if (!allAccounts || allAccounts.length < 1) {
      return undefined;
    }

    if (allAccounts.length === 1) {
      return allAccounts[0];
    } else {
      window.g_app._store.dispatch({ type: 'account/saveSubstrateModal', payload: { substrateModal: true } });
      window.g_app._store.dispatch({ type: 'account/saveSubstrateAccounts', payload: { substrateAccounts: allAccounts } });
    }
  } catch (e) {
    console.error('connect substrate error: ', e);
  }

  return undefined;
}

export async function confirmConnectSubstrate(account) {
  try {
    const address = account.address;
    window.App.loginAddress = address;
    const contract = IMApp.substrateShhContract;
    let keypair = getLocalShhKeyPair(address);
    console.log(`local shh: ${JSON.stringify(keypair)}`);
    if (!keypair || !keypair.id) {
      try {
        const readPubResult = await contract.read('get_shh_pub_key', { gasLimit: -1, value: 0 }, address).send(address);
        const { output: pubOutput } = readPubResult;
        const readPriResult = await contract.read('get_my_shh_pri_key', { gasLimit: -1, value: 0 }, address).send(address);
        const { output: priOutput } = readPriResult;
        const readShhIdResult = await contract.read('get_my_shh_id', { gasLimit: -1, value: 0 }, address).send(address);
        const { output: shhIdOutput } = readShhIdResult;

        keypair = {
          id: shhIdOutput.toHuman().replaceAll(/[^a-zA-Z0-9]/g, ''),
          priKey: priOutput.toHuman().replaceAll(/[^a-zA-Z0-9]/g, ''),
          pubKey: pubOutput.toHuman().replaceAll(/[^a-zA-Z0-9]/g, ''),
        };
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
      console.log(`new shh: ${JSON.stringify(keypair)}`);
      const injector = await web3FromAddress(address);
      const gasLimit = 3000n * 100000000n;
      const idHex = stringToHex(id);
      const priHex = stringToHex(priKey);
      const pubHex = stringToHex(pubKey);
      try {
        const saveResult = await contract.tx.saveMyShh(0, gasLimit, idHex, priHex, pubHex).signAndSend(address, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            message.info('in a block');
          } else if (result.status.isFinalized) {
            message.success('finalized');
          }
          console.log('tx result: ', result.toHuman());
        });
        console.log('save shh result: ', saveResult);
      } catch (e) {
        message.error('save shh error!');
      }
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

    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { auth: true, loginAddress: address, address, visitorMode: false } });
    window.g_app._store.dispatch({ type: 'account/saveAccountType', payload: { accountType: accountType.substrate } });
    window.g_app._store.dispatch({ type: 'user/readChatHistory' });
    window.g_app._store.dispatch({ type: 'user/getBalance' });
    window.g_app._store.dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
    showNotification('connect_metamask', 'success');

    return true;
  } catch (e) {
    console.error('connect to substrate error!');
    message.error('connect to substrate error!');
  }

  return false;
}
