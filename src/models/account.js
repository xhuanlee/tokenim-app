import { formatMessage } from 'umi-plugin-locale';
import { routerRedux } from 'dva/router'
import { showNotification } from '../app/util'
import Wallet from 'ethereumjs-wallet'
import CryptoJS from 'crypto-js'
import { connectMetamask } from '@/app/metamask';
import { connectWallectConnect, loginWalletConnect } from '@/app/walletconnect';
import { confirmConnectSubstrate, connectSubstrate } from '@/app/substrate';
import accountType from '@/app/accountType';

function addPreZero4(num) {
  return (`0000${num}`).slice(-4);
}
const randomname = addPreZero4(Math.round(Math.random() * 10000));

export default {
  namespace: 'account',

  state: {
    registerError: false,
    loginError: false,
    loginErrorMsg: '',

    visitorMode: false,
    auth: false,
    loginLoading: false,
    ensLoading: false,
    registerLoading: false,
    registerENSLoading: false,
    balanceLoading: false,

    wallet: null,
    registerAddress: '',
    registerENSName: '',
    registerKeystore: '',
    registerAes: '',
    password: '',
    address: '',
    regsiterPkAes: '',
    registerPkMd5: '',

    avatar:randomname,// default for those not set avatar
    carrier:'',//elastos carrier id
    loginEns: '',
    loginAddress: '',
    loginKeystore: '',
    balance: '',
    loginPkAes: '',
    loginPkMd5: '',

    queryAccountBalanceError: false,
    ensError: '',
    queryName: '',
    queryAccount: '',
    accountBalancLoading: false,
    accountEther: 0,
    accountToken: 0,

    newWalletLoading: false,
    walletKeystore: '',

    localAccounts: [],
    ensUserList: [],

    newShhKeyError: false,
    shhKeyAvaiable: false,
    shhKeyId: '',
    shhPriKey: '',
    shhPubKey: '',

    symKeyAvaiable: false,
    symKeyId: '',
    symKey: '',

    queryENSLoading: false,
    queryShhLoading: false,
    queryENSAvaiable: false,
    queryENSName: '',
    queryENSAddress: '',
    queryAddress: '',
    queryShhPubKey: '',
    queryShhPubKeyByAddress: '',

    importKeystoreLoading: false,
    importKeystoreError: false,

    isMetamask: false,
    accountType: accountType.club,
    substrateModal: false,
    substrateAccounts: [],
  },

  effects: {
    *getLocalAccount(_, { put }) {
      const AccountsStr = localStorage.getItem('WalletListAES') || '{}';
      const ENSStr = localStorage.getItem('ENSUserListLocal') || '{}';
      let AccountsObj = {};
      let ENSObj = {};
      try {
        AccountsObj = JSON.parse(AccountsStr);
        ENSObj = JSON.parse(ENSStr);
      } catch (e) {
        console.log(e)
      }
      const localAccounts = [];
      const ensUserList = [];
      const providers = Object.keys(AccountsObj);
      providers.forEach((p) => {
        localAccounts.push({
          provider: p,
          addressList: AccountsObj[p] || []
        })
        ensUserList.push({
          provider: p,
          ensList: ENSObj[p] || [],
        })
      });
      yield put({ type: 'saveAccountState', payload: { localAccounts, ensUserList } })
    },

    *importPrivateKey({ payload: { privateKey, password } }, { put, select }) {
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL
      var privateKeyStr = privateKey;

      if (/^0x[0-9a-fA-F]/.test(privateKey)) {
        privateKeyStr = privateKey.substring(2);
      }

      var address = '';
      var aes_pk = '';
      var md5_pk = '';
      try {
        const wallet = Wallet.fromPrivateKey(Buffer.from(privateKeyStr, 'hex'))
        address = wallet.getAddressString();
        aes_pk = CryptoJS.AES.encrypt(wallet.getPrivateKeyString(), password).toString();
        md5_pk = CryptoJS.MD5(wallet.getPrivateKeyString()).toString();

      } catch (e) {
        console.log(e)
        showNotification('importPrivateKey', 'error', formatMessage({ id: 'account.import_pk_format_error' }), 8)
        return;
      }

      // save to local
      if (address && aes_pk && md5_pk) {
        const WalletListStr = localStorage.getItem('WalletListAES') || '{}';
        let WalletObj = {};
        try {
          WalletObj = JSON.parse(WalletListStr);
        } catch (e) {
          console.log(e)
        }
        let WalletList = WalletObj[PROVIDER_URL] || [];
        var filterList = WalletList.filter(i => i.address !== address);
        filterList.unshift({ address, aes_pk, md5_pk, time: new Date().getTime() })
        WalletObj[PROVIDER_URL] = filterList;
        localStorage.setItem('WalletListAES', JSON.stringify(WalletObj));
        showNotification('importPrivateKey', 'success')
      } else {
        showNotification('importPrivateKey', 'error', formatMessage({ id: 'account.import_pk_error' }), 8)
      }

    },

    *importKeystore({ payload: keystore }, { put, select }) {
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL
      yield put({ type: 'saveAccountState', payload: { importKeystoreLoading: true, importKeystoreError: false } })
      var ks = null;
      try {
        ks = JSON.parse(keystore);
      } catch (e) {
        console.log(e)
      }

      if (ks && ks.address && ks.crypto && ks.id && ks.version) {
        const WalletListStr = localStorage.getItem('WalletList') || '{}';
        let WalletObj = {};
        try {
          WalletObj = JSON.parse(WalletListStr);
        } catch (e) {
          console.log(e)
        }
        const WalletList = WalletObj[PROVIDER_URL] || [];
        var filterList = WalletList.filter(i => i.address !== `0x${ks.address}`);
        filterList.unshift({ address: `0x${ks.address}`, keystore, time: new Date().getTime() })
        WalletObj[PROVIDER_URL] = filterList;
        localStorage.setItem('WalletList', JSON.stringify(WalletObj));

        showNotification('importKeystore', 'success')
        yield put({ type: 'saveAccountState', payload: { importKeystoreLoading: false, importKeystoreError: false } })
        yield put(routerRedux.push('/'));
      } else {
        alert(formatMessage({ id: 'account.import_keystore_format_error' }));
        yield put({ type: 'saveAccountState', payload: { importKeystoreLoading: false, importKeystoreError: true } })
      }

    },

    *registerWallet({ payload: { password } }, { put }) {
      yield put({ type: 'saveAccountState', payload: { wallet: null, registerLoading: true, registerENSLoading: false, registerENSName: '', registerKeystore: '' } })
      setTimeout(() => window.App.newWalletAccount(password), 1000);
    },

    *registerENS({ payload: { ensName, password } }, { put }) {
      yield put({ type: 'saveAccountState', payload: { wallet: null, registerLoading: true, registerENSLoading: false, registerENSName: ensName, registerKeystore: '' } })
      setTimeout(() => window.App.newENSAccount(ensName, password), 1000);
    },

    loginInVisitorMode() {
      window.App.loginInVisitorMode();
    },

    *loginWithAddress({ payload: { address, password, query } }, { put }) {
      yield put({ type: 'saveAccountState', payload: { wallet: null, loginLoading: true, ensLoading: false, loginAddress: address, loginEns: '', loginKeystore: '' } })
      setTimeout(() => window.App.loginWithAddress(address, password, query), 1000);
    },

    *loginWithEns({ payload: { ensName, password, query } }, { put }) {
      yield put({ type: 'saveAccountState', payload: { wallet: null, loginLoading: false, ensLoading: true, loginAddress: '', loginEns: '', loginKeystore: '' } })
      setTimeout(() => window.App.loginWithEns(ensName, password, query), 1000);
    },

    *saveEnsName(_, { select }) {
      const account = yield select(state => state.account);
      const { loginEns, loginAddress } = account;
      if (loginEns) {
        window.App.saveENSToLocal(loginEns, loginAddress)
      }
    },

    *logout(_, { put }) {
      yield put({ type: 'resetAccountState' })
      yield put({ type: 'user/resetUserState' })
      window.g_app._store.dispatch(routerRedux.push('/'))
      window.App.logout();
    },

    *getShhState({ payload: shhKeyId }, { put }) {
      if (shhKeyId) {
        window.App.checkShhStatusById(shhKeyId);
      } else {
        yield put({ type: 'saveAccountState', payload: { shhKeyAvaiable: false } });
      }
    },

    *getAccountBalance({ payload: queryAccount }, { put }) {
      yield put({ type: 'saveAccountState', payload: { queryAccount, accountBalancLoading: true, ensError: '', queryName: '' } });
      if (queryAccount && /^0x[0-9a-fA-F]{40}$/.test(queryAccount)) {
        window.App.queryAccountBalance(queryAccount);
      } else {
        console.log(`account formate error: ${queryAccount}`)
      }
    },

    *queryAccountBalanceByENS({ payload: queryName }, { put }) {
      yield put({ type: 'saveAccountState', payload: { queryName, accountBalancLoading: true, ensError: '', queryAccount: '' } });
      window.App.queryAccountBalanceByENS(queryName);
    },

    *checkENSNameAvaiable({ payload: queryENSName }, { put, select }) {
      yield put({ type: 'saveAccountState', payload: { queryENSName, queryENSLoading: true, queryENSAvaiable: false } });
      const init = yield select(state => state.init);
      const { ensContractOK, ensContractAvaiable } = init;
      if (ensContractOK && ensContractAvaiable) {
        window.App.checkENSAvaiable(queryENSName);
      }
    },

    *getEnsUserData({ payload: queryENSName }, { put }) {
      yield put({ type: 'saveAccountState', payload: { queryENSName, queryENSLoading: true, queryShhLoading: false, queryENSAvaiable: true, queryENSAddress: '', queryShhPubKey: '' } });
      window.App.getEnsUserData(queryENSName);
    },

    *getAddressUserData({ payload: address }, { put }) {
      yield put({ type: 'saveAccountState', payload: { queryShhLoading: false, queryAddress: address, queryShhPubKeyByAddress: '' } });
      window.App.getAddressUserData(address);
    },

    *loginWithMetamask({ payload: { query } }, { call, put }) {
      const result = yield call(connectMetamask);
      yield put({ type: 'saveIsMetamask', payload: { isMetamask: result } });
      if (result) {
        yield put({ type: 'saveAccountType', payload: { accountType: accountType.metamask } });
        let q = {};
        if (query) {
          q = query;
          delete q['redirect_uri'];
        }
        yield put(routerRedux.push({ pathname: '/home', query: q }));
        window.ethereum.on('accountsChanged', function () {
          connectMetamask();
        });
      }
    },
    *loginWithWalletConnect({ payload: { query } }, { call, put }) {
      const result = yield call(connectWallectConnect);
      yield put({ type: 'saveIsMetamask', payload: { isMetamask: result } });
      if (result) {
        yield put({ type: 'saveAccountType', payload: { accountType: accountType.walletconnect } });
        let q = {};
        if (query) {
          q = query;
          delete q['redirect_uri'];
        }
        yield put(routerRedux.push({ pathname: '/home', query: q }));
        // window.ethereum.on('accountsChanged', function () {
        //   connectMetamask();
        // });
        window.App.connector.on("session_update", (error, payload) => {
          if (error) {
            throw error;
          }

          // Get updated accounts and chainId
          const { accounts, chainId } = payload.params[0];
          console.log(JSON.stringify(accounts),chainId);
          loginWalletConnect(this,accounts[0]);
        });

      }
    },
    *loginWithSubstrate(_, { call, put }) {
      const account = yield call(connectSubstrate);
      if (account) {
        yield put({ type: 'chooseSubstrateAccount', payload: { account } });
      }
    },
    *chooseSubstrateAccount({ payload: { account } }, { call, put }) {
      const { address } = account;
      yield put({ type: 'saveAddress', payload: { address } });
      yield put({ type: 'saveSubstrateModal', payload: { substrateModal: false } });
      const result = yield call(confirmConnectSubstrate, account, 'api', 'contract');
      yield put(routerRedux.push('/home'));
    },
  },

  reducers: {
    saveAccountState(state, action) {
      return { ...state, ...action.payload }
    },

    resetAccountState(state) {
      return {
        ...state,
        registerError: false,
        loginError: false,
        loginErrorMsg: '',

        visitorMode: false,
        auth: false,
        loginLoading: false,
        ensLoading: false,
        registerLoading: false,
        registerENSLoading: false,
        balanceLoading: false,

        wallet: null,
        registerAddress: '',
        registerENSName: '',
        registerKeystore: '',
        registerAes: '',
        password: '',
        address: '',
        regsiterPkAes: '',
        registerPkMd5: '',

        loginEns: '',
        loginAddress: '',
        loginKeystore: '',
        balance: '',
        loginPkAes: '',
        loginPkMd5: '',

        queryAccountBalanceError: false,
        ensError: '',
        queryName: '',
        queryAccount: '',
        accountBalancLoading: false,
        accountEther: 0,
        accountToken: 0,

        newWalletLoading: false,
        walletKeystore: '',

        localAccounts: [],
        ensUserList: [],

        newShhKeyError: false,
        shhKeyAvaiable: false,
        shhKeyId: '',
        shhPriKey: '',
        shhPubKey: '',

        symKeyAvaiable: false,
        symKeyId: '',
        symKey: '',

        queryENSLoading: false,
        queryShhLoading: false,
        queryENSAvaiable: false,
        queryENSName: '',
        queryENSAddress: '',
        queryAddress: '',
        queryShhPubKey: '',
        queryShhPubKeyByAddress: '',

        importKeystoreLoading: false,
        importKeystoreError: false,
      }
    },

    saveAddress(state, { payload: { address } }) {
      return { ...state, address };
    },
    saveIsMetamask(state, { payload: { isMetamask } }) {
      return { ...state, isMetamask };
    },
    saveAccountType(state, { payload: { accountType } }) {
      return { ...state, accountType };
    },
    saveSubstrateModal(state, { payload: { substrateModal } }) {
      return { ...state, substrateModal };
    },
    saveSubstrateAccounts(state, { payload: { substrateAccounts } }) {
      return { ...state, substrateAccounts };
    },
  },

};
