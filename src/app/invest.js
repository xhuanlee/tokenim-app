import { converter } from '@/app/util';
import { message } from 'antd';
import Common from 'ethereumjs-common';
import { Transaction } from 'ethereumjs-tx';

export async function refreshUserInfo(address) {
  const userDeposits = await window.FaxTokenImAPI.investContract.getUserAmountOfDeposits.call(address);
  const userInvested = await window.FaxTokenImAPI.investContract.getUserTotalDeposits.call(address);
  const userWithdrawn = await window.FaxTokenImAPI.investContract.getUserTotalWithdrawn.call(address);
  const userDividends = await window.FaxTokenImAPI.investContract.getUserDividends.call(address);
  const referrer = await window.FaxTokenImAPI.investContract.getUserReferrer.call(address);
  const referralBonus = await window.FaxTokenImAPI.investContract.getUserReferralBonus.call(address);
  const userDepositDetail = [];
  if (userDeposits > 0) {
    for (let i = 0; i < userDeposits; i++) {
      const [amount, withdrawn, start] = await window.FaxTokenImAPI.investContract.getUserDepositInfo.call(address, i);
      userDepositDetail.push({ amount: amount.toNumber() / converter.Ether, withdrawn: withdrawn.toNumber() / converter.Ether, start: start.toNumber() });
    }
  }

  window.g_app._store.dispatch({
    type: 'invest/saveUserInfo',
    payload: {
      userDeposits: userDeposits.toNumber(),
      userDepositDetail,
      userInvested: userInvested.toNumber() / converter.Ether,
      userDividends: userDividends.toNumber() / converter.Ether,
      referrer: referrer.toString() === '0x0000000000000000000000000000000000000000' ? '' : referrer.toString(),
      referralBonus: referralBonus.toNumber() / converter.Ether,
      userWithdrawn: userWithdrawn.toNumber() / converter.Ether,
    },
  });
}

export async function refreshContractInfo() {
  const contractBalance = await window.FaxTokenImAPI.investContract.getContractBalance.call();
  const contractBalanceRate = await window.FaxTokenImAPI.investContract.getContractBalanceRate.call();
  const totalDeposits = await window.FaxTokenImAPI.investContract.totalDeposits.call();
  const totalInvested = await window.FaxTokenImAPI.investContract.totalInvested.call();
  const totalWithdrawn = await window.FaxTokenImAPI.investContract.totalWithdrawn.call();
  const totalUsers = await window.FaxTokenImAPI.investContract.totalUsers.call();

  window.g_app._store.dispatch({
    type: 'invest/saveContractInfo',
    payload: {
      contractBalance: contractBalance.toNumber() / converter.Ether,
      contractBalanceRate: contractBalanceRate.toNumber(),
      totalDeposits: totalDeposits.toNumber(),
      totalInvested: totalInvested.toNumber() / converter.Ether,
      totalWithdrawn: totalWithdrawn.toNumber() / converter.Ether,
      totalUsers: totalUsers.toNumber(),
    },
  });
}

export async function invest(referrer, value, from, privateKey) {
  try {
    const nonce = await window.FaxTokenImAPI.getTransactionCount(from);
    const data = window.FaxTokenImAPI.web3InvestContract.invest.getData(referrer);
    const common = Common.forCustomChain('mainnet', {
      name: 'allcom',
      networkId: 1515,
      chainId: 1515,
    }, 'petersburg');
    const txParam = {
      nonce: window.FaxTokenImAPI.web3.toHex(nonce),
      from,
      to: window.FaxTokenImAPI.investContract.address,
      data,
      value,
    };
    console.log('estimate invest gas param: ', txParam);
    const gasEstimate = await window.FaxTokenImAPI.estimateGas(txParam);
    const gasPrice = '0x4a817c800';
    const gas = window.FaxTokenImAPI.web3.toHex(gasEstimate);
    const finalTxParam = { ...txParam, gas, gasPrice };
    console.log('invest tx param: ', finalTxParam);
    const tx = new Transaction(finalTxParam, { common });
    tx.sign(privateKey);
    const serializedTx = '0x' + tx.serialize().toString('hex');
    const txHash = await window.FaxTokenImAPI.sendRawTransaction(serializedTx);
    console.log('invest hash: ', txHash);

    return true;
  } catch (e) {
    console.error('invest error: ', e);
    message.error(`invest error: ${e.message}`);
  }

  return false;
}

export async function investMetamask(referrer, value) {
  const data = window.FaxTokenImAPI.web3InvestContract.invest.getData(referrer);
  const params = {
    from: window.ethereum.selectedAddress,
    to: window.FaxTokenImAPI.investContract.address,
    value,
    data,
  };

  try {
    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    });
    return true;
  } catch (e) {
    console.error('invest error: ', e);
    message.error(`invest error: ${e.message}`);
  }

  return false;
}

export async function withdraw(from, privateKey) {
  try {
    const nonce = await window.FaxTokenImAPI.getTransactionCount(from);
    const data = window.FaxTokenImAPI.web3InvestContract.withdraw.getData();
    const common = Common.forCustomChain('mainnet', {
      name: 'allcom',
      networkId: 1515,
      chainId: 1515,
    }, 'petersburg');
    const txParam = {
      nonce: window.FaxTokenImAPI.web3.toHex(nonce),
      from,
      to: window.FaxTokenImAPI.investContract.address,
      data,
    };
    console.log('estimate withdraw gas param: ', txParam);
    const gasEstimate = await window.FaxTokenImAPI.estimateGas(txParam);
    const gasPrice = '0x4a817c800';
    const gas = window.FaxTokenImAPI.web3.toHex(gasEstimate);
    const finalTxParam = { ...txParam, gas, gasPrice };
    console.log('withdraw tx param: ', finalTxParam);
    const tx = new Transaction(finalTxParam, { common });
    tx.sign(privateKey);
    const serializedTx = '0x' + tx.serialize().toString('hex');
    const txHash = await window.FaxTokenImAPI.sendRawTransaction(serializedTx);
    console.log('withdraw hash: ', txHash);
  } catch (e) {
    console.error('withdraw error: ', e);
    message.error(`withdraw error: ${e.message}`);
  }
}

export async function withdrawMetamask() {
  const data = window.FaxTokenImAPI.web3InvestContract.withdraw.getData();
  const params = {
    from: window.ethereum.selectedAddress,
    to: window.FaxTokenImAPI.investContract.address,
    data,
  };

  try {
    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    });
  } catch (e) {
    console.error('withdraw error: ', e);
    message.error(`invest error: ${e.message}`);
  }
}
