import { invest, investMetamask, refreshContractInfo, refreshUserInfo, withdraw, withdrawMetamask } from '@/app/invest';
import { converter } from '@/app/util';
import { message } from 'antd';

const defaultState = {
  contractBalance: 0,
  contractBalanceRate: 0,
  // 用户投资次数
  userDeposits: 0,
  // 用户投资总额
  userInvested: 0,
  // 用户投资详情
  userDepositDetail: [],
  // 合约合计投资次数
  totalDeposits: 0,
  // 合约合计投资总额
  totalInvested: 0,
  // 合约合计投资人数
  totalUsers: 0,
  totalWithdrawn: 0,
  // 用户分红
  userDividends: 0,
  // 用户推荐人
  referrer: '',
  // 用户推荐奖励
  referralBonus: 0,
  userWithdrawn: 0,
  investModal: false,
};

export default {
  namespace: 'invest',

  state: defaultState,

  effects: {
    *invest({ payload: { referrer,value } }, { call, put, select }) {
      const isMetamask = yield select(state => state.account.isMetamask);
      let success = false;
      if (isMetamask) {
        success = yield call(investMetamask, referrer, window.FaxTokenImAPI.web3.toHex(value * converter.Ether));
      } else {
        const from = yield select(state => state.account.address);
        const privateKey = yield select(state => state.account.wallet.privateKey);
        success = yield call(invest, referrer, window.FaxTokenImAPI.web3.toHex(value * converter.Ether), from, privateKey);
      }

      if (success) {
        yield put({ type: 'hideInvestModal' });
        yield put({ type: 'refreshContractInfo' });
        yield put({ type: 'refreshUserInfo' });
        message.success('invest success');
      }
    },
    *withdraw(_, { call, put, select }) {
      const isMetamask = yield select(state => state.account.isMetamask);
      if (isMetamask) {
        yield call(withdrawMetamask);
      } else {
        const from = yield select(state => state.account.address);
        const privateKey = yield select(state => state.account.wallet.privateKey);
        yield call(withdraw, from, privateKey);
      }
      yield put({ type: 'refreshContractInfo' });
      yield put({ type: 'refreshUserInfo' });
    },
    *refreshContractInfo(_, { call }) {
      yield call(refreshContractInfo);
    },
    *refreshUserInfo(_, { call, select }) {
      const address = yield select(state => state.account.address);
      yield call(refreshUserInfo, address);
    },
  },

  reducers: {
    saveContractInfo(state, { payload: { contractBalance, contractBalanceRate, totalDeposits, totalInvested, totalUsers, totalWithdrawn } }) {
      return { ...state, contractBalance, contractBalanceRate, totalDeposits, totalInvested, totalUsers, totalWithdrawn };
    },
    saveUserInfo(state, { payload: { userDeposits, userInvested, userDepositDetail, userDividends, referrer, referralBonus, userWithdrawn } }) {
      return { ...state, userDeposits, userInvested, userDepositDetail, userDividends, referrer, referralBonus, userWithdrawn };
    },
    saveChatUser(state, { payload: { chatUser } }) {
      return { ...state, chatUser };
    },
    showInvestModal(state) {
      return { ...state, investModal: true };
    },
    hideInvestModal(state) {
      return { ...state, investModal: false };
    },
  }
};
