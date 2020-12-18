import { message as ant_message } from 'antd'
import { formatMessage } from 'umi-plugin-locale';
import { transferEther } from '@/app/metamask';
export default {
  namespace: 'user',

  state: {
    getBalanceError: false,
    balanceLoading: false,

    registerReward: 0,
    registerRewardLoading: false,
    getResigerRewardError: false,
    loginReward: 0,
    loginRewardLoading: false,
    getloginRewardError: false,

    faxBalance: 0,
    etherBalance: 0,

    transEtherError: false,
    transEtherLoading: false,
    transEtherTo: '',
    transEtherNumber: 0,

    transFaxError: false,
    transFaxLoading: false,
    transFaxTo: '',
    transFaxNumber: 0,

    buyFaxError: false,
    buyFaxLoading: false,
    buyFaxNumber: 0,
    buyEtherCost: 0,

    approveError: false,
    approveLoading: false,
    approveAddress: '',
    approveFaxNumber: 0,

    messageSendError: false,
    messageSendLoading: false,
    chatHistoryLoading: false,
    pendingMessage: [],
    message: [],
    friends: [],
  },

  effects: {
    *getUserInfo(_, { put, select }) {
      const initState = yield select(state => state.init);
      const address = yield select(state => state.account.loginAddress);
      const { providerOK, tokenContractOK, imContractOK, saleContractOK } = initState;
      if (providerOK && tokenContractOK && imContractOK && saleContractOK) {
        clearInterval(window.tryUntilContractReady_user);
        yield put({ type: 'saveUserState', payload: { balanceLoading: true, registerRewardLoading: true, loginRewardLoading: true } })
        window.App.balanceOf(address);
        window.App.checkRegisterReward(address);
        window.App.checkLoginReward(address);
      } else {
        window.tryUntilContractReady_user = setInterval(() => {
          const userCount = window.userCount || 0;
          if (userCount > 10) {
            clearInterval(window.tryUntilContractReady_user)
          }
          window.userCount = userCount + 1;
          window.g_app._store.dispatch({ type: 'user/getUserInfo' })
        }, 2000)
      }
    },

    *getBalance(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { balanceLoading: true } });
      const address = yield select(state => state.account.address);
      window.App.balanceOf(address);
    },

    *checkRegisterReward(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { registerRewardLoading: true } });
      const address = yield select(state => state.account.address);
      window.App.checkRegisterReward(address);
    },

    *checkLoginReward(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { loginRewardLoading: true } });
      const address = yield select(state => state.account.address);
      window.App.checkLoginReward(address);
    },

    *getRegisterReward(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { registerRewardLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const address = yield select(state => state.account.address);
      const wallet = yield select(state => state.account.wallet);
      if (wallet && wallet.privateKey) {
        window.App.getRegisterReward(address, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_reward_forbidden' }));
        yield put({ type: 'saveUserState', payload: { registerRewardLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { registerRewardLoading: false } });
      }
    },

    *getLoginReward(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { loginRewardLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const address = yield select(state => state.account.address);
      const wallet = yield select(state => state.account.wallet);
      if (wallet && wallet.privateKey) {
        window.App.getLoginReward(address, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_reward_forbidden' }))
        yield put({ type: 'saveUserState', payload: { loginRewardLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { loginRewardLoading: false } });
      }
    },

    *transEther({ payload: { to, ether } }, { put, select }) {
      yield put({ type: 'saveUserState', payload: { transEtherLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const account = yield select(state => state.account);
      const wallet = yield select(state => state.account.wallet);
      const { address } = account;
      if (wallet && wallet.privateKey) {
        window.App.transferEther(address, to, ether, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_transaction_forbidden' }))
        yield put({ type: 'saveUserState', payload: { transEtherLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { transEtherLoading: false } });
      }
    },

    *transFax({ payload: { to, fax } }, { put, select }) {
      yield put({ type: 'saveUserState', payload: { transFaxLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const account = yield select(state => state.account);
      const wallet = yield select(state => state.account.wallet);
      const { address } = account;
      if (wallet && wallet.privateKey) {
        window.App.transferFax(address, to, fax, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_transaction_forbidden' }))
        yield put({ type: 'saveUserState', payload: { transFaxLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { transFaxLoading: false } });
      }
    },

    *buyFax({ payload: { faxNumber } }, { put, select }) {
      yield put({ type: 'saveUserState', payload: { buyFaxLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const account = yield select(state => state.account);
      const saleTokenPrice = yield select(state => state.contract.saleTokenPrice)
      const wallet = yield select(state => state.account.wallet);
      const { address } = account;
      const value = saleTokenPrice * faxNumber;
      if (wallet && wallet.privateKey) {
        window.App.buyFax(address, faxNumber, value, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_transaction_forbidden' }))
        yield put({ type: 'saveUserState', payload: { buyFaxLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { buyFaxLoading: false } });
      }
    },

    *approve({ payload: { contract, faxNumber } }, { put, select }) {
      yield put({ type: 'saveUserState', payload: { approveLoading: true } });
      const visitorMode = yield select(state => state.account.visitorMode);
      const account = yield select(state => state.account);
      const wallet = yield select(state => state.account.wallet);
      const { address } = account;
      if (wallet && wallet.privateKey) {
        window.App.approve(address, contract, faxNumber, wallet.privateKey);
      } else if (visitorMode) {
        ant_message.warning(formatMessage({ id: 'user.visitor_transaction_forbidden' }))
        yield put({ type: 'saveUserState', payload: { approveLoading: false } });
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
        yield put({ type: 'saveUserState', payload: { approveLoading: false } });
      }
    },

    // *sendImage({ payload: { to, shhPubKey, image } }) {
    //   window.App.sendImage(to, shhPubKey, image)
    // },

    saveImageToSwarmCreateDirectory({ payload: { group, to, shhPubKey, fileName, formData } }) {
      window.App.saveImageToSwarmCreateDirectory({ to, shhPubKey, group }, fileName, formData)
    },

    *sendImageMessage({ payload: { to, shhPubKey, fileName, fileHash } }, { put }) {
      yield put({ type: 'sendShhMessage', payload: { to, shhPubKey, currentMessage: `${fileHash}/${fileName}`, type: 'image' } });
    },

    *sendShhMessage({ payload: { to, shhPubKey, currentMessage, type } }, { put, select }) {
      const time = (new Date()).getTime();
      var user = yield select(state => state.user);
      const account = yield select(state => state.account);
      const { address, loginEns, shhPubKey: mySHHPubKey } = account;
      const { pendingMessage } = user;
      const message = {
        name: loginEns,
        shh: mySHHPubKey,
        from: address,
        type: type || 'text',
        content: currentMessage,
      }
      pendingMessage.push({ from: address, to, message: currentMessage, type: type || 'text', time })

      yield put({ type: 'addPendingMessage', payload: { from: address, to, message: currentMessage, type: type || 'text', time } })
      setTimeout(window.App.sendShhMessage(shhPubKey, JSON.stringify(message), time), 1500)
    },

    *sendGroupImageMessage({ payload: { fileName, fileHash } }, { put }) {
      yield put({ type: 'sendGroupMessage', payload: { currentMessage: `${fileHash}/${fileName}`, type: 'image' } });
    },

    *sendGroupMessage({ payload: { currentMessage, type } }, { put, select }) {
      const time = (new Date()).getTime();
      var user = yield select(state => state.user);
      const account = yield select(state => state.account);
      const { address, symKeyId, loginEns } = account;
      const { pendingMessage } = user;
      const message = {
        name: loginEns,
        from: address,
        group: true,
        type: type || 'text',
        content: currentMessage,
      }
      pendingMessage.push({ from: address, message: currentMessage, type: type || 'text', group: true, time })

      yield put({ type: 'addPendingMessage', payload: { from: address, message: currentMessage, type: type || 'text', group: true, time } })
      setTimeout(window.App.sendShhSymMessage(symKeyId, JSON.stringify(message), time), 1500)
    },

    *shhMessageSendSuccess({ payload: time }, { put, select }) {
      const user = yield select(state => state.user);
      const { message, pendingMessage } = user;
      const sendMessage = pendingMessage.filter(i => i.time === time);
      if (sendMessage.length > 0) {
        message.push(sendMessage[0]);
        yield put({ type: 'removePendingMessage', payload: time })
        yield put({ type: 'addChatMessage', payload: sendMessage[0] })
      }
    },

    *receiveNewMessage({ payload: messageBody }, { put, select }) {
      const account = yield select(state => state.account);
      const { address } = account;

      const message = {
        from: messageBody.from,
        name: messageBody.name,
        to: address,
        group: messageBody.group,
        type: messageBody.type,
        message: messageBody.content,
        time: (new Date()).getTime(),
      }

      if (messageBody && messageBody.group) {
        yield put({ type: 'addChatMessage', payload: { ...message, to: '' } });
      } else if (messageBody && messageBody.from) {
        // updata friend pubkey
        window.App.addNewFriend(messageBody.from, messageBody.name, messageBody.shh);
        yield put({ type: 'addChatMessage', payload: message })
      }
    },

    *sendMessage({ payload: { to, message } }, { put, select }) {
      const account = yield select(state => state.account);
      const wallet = yield select(state => state.account.wallet);
      const { address } = account;
      yield put({ type: 'addPendingMessage', payload: { from: address, to, message, time: (new Date()).getTime() } });
      if (wallet && wallet.privateKey) {
        window.App.sendMessage(address, to, message, wallet.privateKey);
      } else {
        alert(formatMessage({ id: 'user.account_error' }))
      }
    },

    *readChatHistory(_, { put, select }) {
      yield put({ type: 'saveUserState', payload: { chatHistoryLoading: true } });
      const account = yield select(state => state.account);
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL;
      const { address } = account;
      const FriendsListStr = localStorage.getItem('FriendsList') || '{}';
      const MessageListStr = localStorage.getItem('MessageList') || '{}';
      let FriendsListObj = {};
      let MessageListObj = {};
      try {
        FriendsListObj = JSON.parse(FriendsListStr);
        MessageListObj = JSON.parse(MessageListStr);
      } catch (e) {
        console.log(e)
      }
      const friends = FriendsListObj[PROVIDER_URL] && FriendsListObj[PROVIDER_URL][address] || [];
      const message = MessageListObj[PROVIDER_URL] && MessageListObj[PROVIDER_URL][address] || [];
      yield put({ type: 'saveUserState', payload: { friends, message } })
    },

    *changeFriendName({ payload: { nickName, friendAddress } }, { put, select }) {
      const friends = yield select(state => state.user.friends);
      const providerURL = yield select(state => state.init.providerURL);
      const address = yield select(state => state.account.address);
      const newFriends = friends.map(f => {
        if (f.address === friendAddress) {
          return { ...f, nickName };
        }
        return f;
      });

      const FriendsListStr = localStorage.getItem('FriendsList') || '{}';
      let FriendsListObj = {};
      try {
        FriendsListObj = JSON.parse(FriendsListStr);
      } catch (e) {
        console.log(e)
      }
      if (FriendsListObj[providerURL]) {
        FriendsListObj[providerURL][address] = newFriends;
      } else {
        FriendsListObj[providerURL] = {};
        FriendsListObj[providerURL][address] = newFriends;
      }
      localStorage.setItem('FriendsList', JSON.stringify(FriendsListObj));
      yield put({ type: 'saveUserState', payload: { friends: newFriends } });
    },

    *addFriend({ payload: { friendAddress, nickName, ensName, shhPubKey, chat } }, { put, select }) {
      const d = new Date();
      const time = d.getTime();

      const friends = yield select(state => state.user.friends);
      const account = yield select(state => state.account);
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL;
      const { address } = account;

      // if address is already exist, push it to top
      const existFriends = friends.filter(i => i.address === friendAddress);
      let existNickName = undefined;
      let existEnsName = '';
      let existShhPubKey = '';
      var existTime = time;
      if (existFriends.length > 0) {
        existNickName = existFriends[0].nickName;
        existEnsName = existFriends[0].ensName;
        existShhPubKey = existFriends[0].shhPubKey;
        existTime = existFriends[0].time;
      }

      const filterFriends = friends.filter(i => i.address !== friendAddress);
      const newFriend = { nickName: existNickName || nickName, address: friendAddress, time: existTime, ensName: ensName || existEnsName, shhPubKey: shhPubKey || existShhPubKey };
      if (chat) {
        yield put({ type: 'media/saveChatUser', payload: { chatUser: newFriend } });
      }
      filterFriends.unshift(newFriend);
      const FriendsListStr = localStorage.getItem('FriendsList') || '{}';
      let FriendsListObj = {};
      try {
        FriendsListObj = JSON.parse(FriendsListStr);
      } catch (e) {
        console.log(e)
      }
      if (FriendsListObj[PROVIDER_URL]) {
        FriendsListObj[PROVIDER_URL][address] = filterFriends;
      } else {
        FriendsListObj[PROVIDER_URL] = {};
        FriendsListObj[PROVIDER_URL][address] = filterFriends;
      }
      localStorage.setItem('FriendsList', JSON.stringify(FriendsListObj));
      yield put({ type: 'saveUserState', payload: { friends: filterFriends } })
    },

    *addChatMessage({ payload: message }, { put, select }) {
      const account = yield select(state => state.account);
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL;
      const { address } = account;

      const MessageListStr = localStorage.getItem('MessageList') || '{}';
      let MessageListObj = {};
      try {
        MessageListObj = JSON.parse(MessageListStr);
      } catch (e) {
        console.log(e)
      }
      const messageList = (MessageListObj[PROVIDER_URL] && MessageListObj[PROVIDER_URL][address]) || [];
      messageList.unshift(message)
      if (MessageListObj[PROVIDER_URL]) {
        MessageListObj[PROVIDER_URL][address] = messageList;
      } else {
        MessageListObj[PROVIDER_URL] = {};
        MessageListObj[PROVIDER_URL][address] = messageList;
      }
      localStorage.setItem('MessageList', JSON.stringify(MessageListObj));
      yield put({ type: 'saveUserState', payload: { message: messageList } })
    },

    *addPendingMessage({ payload: { from, to, message, time, type } }, { put, select }) {
      const account = yield select(state => state.account);
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL;
      const { address } = account;

      const PendingMsgStr = localStorage.getItem('PendingMessage') || '{}';
      let PendingMsgObj = {};
      try {
        PendingMsgObj = JSON.parse(PendingMsgStr);
      } catch (e) {
        console.log(e)
      }
      const pendingMessage = PendingMsgObj[PROVIDER_URL] && PendingMsgObj[PROVIDER_URL][address] || [];
      pendingMessage.unshift({ from, to, message, time, type })
      if (PendingMsgObj[PROVIDER_URL]) {
        PendingMsgObj[PROVIDER_URL][address] = pendingMessage;
      } else {
        PendingMsgObj[PROVIDER_URL] = {};
        PendingMsgObj[PROVIDER_URL][address] = pendingMessage;
      }
      localStorage.setItem('PendingMessage', JSON.stringify(PendingMsgObj));
      yield put({ type: 'saveUserState', payload: { pendingMessage } })
    },

    *removePendingMessage({ payload: time }, { put, select }) {
      const account = yield select(state => state.account);
      const init = yield select(state => state.init);
      const PROVIDER_URL = init.providerURL;
      const { address } = account;

      const PendingMsgStr = localStorage.getItem('PendingMessage') || '{}';
      let PendingMsgObj = {};
      try {
        PendingMsgObj = JSON.parse(PendingMsgStr);
      } catch (e) {
        console.log(e)
      }
      const pendingMessage = PendingMsgObj[PROVIDER_URL] && PendingMsgObj[PROVIDER_URL][address] || [];
      const filterMessge = pendingMessage.filter(i => i.time !== time);
      PendingMsgObj[PROVIDER_URL][address] = filterMessge;

      localStorage.setItem('PendingMessage', JSON.stringify(PendingMsgObj));
      yield put({ type: 'saveUserState', payload: { pendingMessage: filterMessge } })
    },

    *metamaskTransferEth({ payload: { to, value } }, { call, select }) {
      const from = yield select(state => state.account.address);
      yield call(transferEther, from, to, value);
    },
  },

  reducers: {
    saveUserState(state, action) {
      return { ...state, ...action.payload }
    },
    resetTransState(state) {
      return {
        ...state,
        transEtherError: false,
        transEtherLoading: false,
        transEtherTo: '',
        transEtherNumber: 0,

        transFaxError: false,
        transFaxLoading: false,
        transFaxTo: '',
        transFaxNumber: 0,
      }
    },
    resetUserState(state) {
      return {
        ...state,
        getBalanceError: false,
        balanceLoading: false,

        registerReward: 0,
        registerRewardLoading: false,
        getResigerRewardError: false,
        loginReward: 0,
        loginRewardLoading: false,
        getloginRewardError: false,

        faxBalance: 0,
        etherBalance: 0,

        transEtherError: false,
        transEtherLoading: false,
        transEtherTo: '',
        transEtherNumber: 0,

        transFaxError: false,
        transFaxLoading: false,
        transFaxTo: '',
        transFaxNumber: 0,

        buyFaxError: false,
        buyFaxLoading: false,
        buyFaxNumber: 0,
        buyEtherCost: 0,

        approveError: false,
        approveLoading: false,
        approveAddress: '',
        approveFaxNumber: 0,
      }
    },
  },
};
