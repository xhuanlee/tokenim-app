// 我们的目标是调用ShhDataContract中的saveShhPubKey保存carrier的对外address
// 代码的例子是调用saveShhName,就名字，也可以把app现在的名字保存过去
// step 1. 调用Web3初始化contract（通过contract的abi）
const c = FaxTokenImAPI.web3.eth.contract(ShhData.abi)
FaxTokenImAPI.web3ShhDataContract = c.at(ShhData.networks[network_id].address);
// step 2. 调用合约中的函数
const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
// step 3. 调用钱包签名授权执行合约
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



// initial
import UserData from '../../abi/UserData';

//import { FaxTokenImAPI } from '@/app/api';
import { message } from 'antd';
import { network_id } from '../../config';
import { default as contract } from 'truffle-contract';
import ShhData from '../../truffle/shh-data/build/contracts/ShhData';
import Web3 from 'web3';

export const FaxTokenImAPI = {
  web3: new Web3(),
  dataContract: null,
  shhDataContract: null,

  // not use this
initUserDataContract: () => {
  // web3 contract instance
  const c = FaxTokenImAPI.web3.eth.contract(UserData.abi)
  FaxTokenImAPI.web3DataContract = c.at(UserData.networks[network_id].address);

  // truffle contract instance
  const userDataContract = contract(UserData);
  userDataContract.setProvider(FaxTokenImAPI.web3.currentProvider);

  return new Promise((resolve, reject) => {
    userDataContract.deployed().then(instance => {
      FaxTokenImAPI.dataContract = instance;
      resolve(instance.address);
    }).catch(err => {
      reject(err);
    })
  })
},
  initShhDataContract: () => {
  // web3 contract instance
  const c = FaxTokenImAPI.web3.eth.contract(ShhData.abi)
  FaxTokenImAPI.web3ShhDataContract = c.at(ShhData.networks[network_id].address);

  // truffle contract instance
  const shhDataContract = contract(ShhData);
  shhDataContract.setProvider(FaxTokenImAPI.web3.currentProvider);

  return new Promise((resolve, reject) => {
    shhDataContract.deployed().then(instance => {
      FaxTokenImAPI.shhDataContract = instance;
      resolve(instance.address);
    }).catch(err => {
      reject(err);
    })
  })
},



export async function saveShhName(name) {
// replace it with saveShhPubKey
  try {
    const nonce = await FaxTokenImAPI.getTransactionCount(window.ethereum.selectedAddress);
    const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
    // replace it with saveShhPubKey
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
