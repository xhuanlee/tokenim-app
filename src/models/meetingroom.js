import { fetchMoreRoom, fetchUser, isHost, saveChatRoom, saveUser } from '@/service/licodeclient';

const defaultState = {
  rooms: [],
  listeners: [],
  totalRoom: 0,
  currentRoom: null,
  meetingServer:null,
  hasMore: true,
  user: null,
  needCreate: false,
  newChatRoomModal: false,
  page: 1,
  audioEnable: true,
  // including moderators
  onlineSpeakers: [],
};

const INIT_SIZE = 20;
const PAGE_SIZE = 5;
const morePage = INIT_SIZE / PAGE_SIZE + 1;

export default {
  namespace: 'meetingroom',

  state: defaultState,

  effects: {
    *fetchMore(_, { call, put, select }) {
      const meetingServer = yield select(state => state.meetingroom.meetingServer);
      console.log("server 1:"+meetingServer);
      const page = yield select(state => state.meetingroom.page);
      const response = yield call(fetchMoreRoom, meetingServer, page, PAGE_SIZE);
      const { code, data } = response;
      if (code && code == 200) {
        const oldRooms = yield select(state => state.meetingroom.rooms);
        const rooms = oldRooms.concat(data.list);
        yield put({ type: 'saveRooms', payload: { rooms } });
        yield put({ type: 'saveTotalRoom', payload: { totalRoom: data.total } });
        yield put({ type: 'savePage', payload: { page: page + 1 } });
        if (page >= Math.ceil(data.total / PAGE_SIZE)) {
          yield put({ type: 'saveHasMore', payload: { hasMore: false } });
        }
      }
    },
    *fetchRooms(_, { call, put, select }) {
      const meetingServer = yield select(state => state.meetingroom.meetingServer);
      console.log("server:"+meetingServer);
      const response = yield call(fetchMoreRoom, meetingServer, 1, 20);
//      const { code, data } = response;
      const data = response;
//      if (code && code == 200)
      if (data)
      {
        yield put({ type: 'savePage', payload: { page: morePage } });
        yield put({ type: 'saveRooms', payload: { rooms: data } });
        yield put({ type: 'saveTotalRoom', payload: { totalRoom: data.length } });
        if (morePage >= Math.ceil(data.length / PAGE_SIZE)) {
          yield put({ type: 'saveHasMore', payload: { hasMore: false } });
        }
      }
    },
    *fetchUser(_, { call, put, select }) {
      const address = yield select(state => state.account.address);
      const response = yield call(fetchUser, address);
      const { code, data } = response || {};
      if (code && code === 200) {
        yield put({ type: 'saveNeedCreate', payload: { needCreate: false } });
        yield put({ type: 'saveUser', payload: { user: data.entry } });
      } else {
        yield put({ type: 'saveNeedCreate', payload: { needCreate: true } });
      }
    },
    *saveServerUser({ payload: { user } }, { call, put, select }) {
      const address = yield select(state => state.account.address);
      user.append('address', address);
      const response = yield call(saveUser, user);
      const { code, data } = response || {};
      if (code && code === 200) {
        yield put({ type: 'saveUser', payload: { user: data.entry } });
        yield put({ type: 'saveNeedCreate', payload: { needCreate: false } });
      } else {
        yield put({ type: 'saveNeedCreate', payload: { needCreate: true } });
      }
    },
    *saveNewChatRoom({ payload: { room } }, { call, put, select }) {
      const address = yield select(state => state.account.address);
      room.append('createBy', address);
      const response = yield call(saveChatRoom, room);
      const { code } = response || {};
      if (code && code === 200) {
        yield put({ type: 'fetchRooms' });
        yield put({ type: 'saveNewChatRoomModal', payload: { newChatRoomModal: false } });
      }
    },
    *userJoin({ payload: { address } }, { call, put, select }) {
//       const response = yield call(fetchUser, address);
//       const oldListeners = yield select(state => state.clubhouse.listeners);
//       const { code, data } = response;
//       if (code && code === 200) {
//         const listeners = [ data.entry, ...oldListeners ];
//         yield put({ type: 'saveListeners', payload: { listeners } });
// //        yield put({ type: 'saveOnlineSpeakers', payload: { listeners } });
//       }
      // const oldOnlineSpeakers = yield select(state => state.meetingroom.onlineSpeakers);
      // // const room = yield select(state => state.clubhouse.currentRoom);
      // // if (isHost(room, address)) {
      //   const onlineSpeakers = oldOnlineSpeakers.concat(data.entry);
      //   yield put({ type: 'saveOnlineSpeakers', payload: { onlineSpeakers } });
      // }
    }
  },

  reducers: {
    saveRooms(state, { payload: { rooms } }) {
      return { ...state, rooms };
    },
    saveTotalRoom(state, { payload: { totalRoom } }) {
      return { ...state, totalRoom };
    },
    saveCurrentRoom(state, { payload: { currentRoom } }) {
      return { ...state, currentRoom };
    },
    saveUser(state, { payload: { user } }) {
      return { ...state, user };
    },
    saveNeedCreate(state, { payload: { needCreate } }) {
      return { ...state, needCreate };
    },
    saveNewChatRoomModal(state, { payload: { newChatRoomModal } }) {
      return { ...state, newChatRoomModal };
    },
    savePage(state, { payload: { page } }) {
      return { ...state, page };
    },
    saveHasMore(state, { payload: { hasMore } }) {
      return { ...state, hasMore };
    },
    saveListeners(state, { payload: { listeners } }) {
      return { ...state, listeners };
    },
    userLeft(state, { payload: { address } }) {
      const listeners = state.listeners.filter((u) => u.address !== address);
      const onlineSpeakers = state.onlineSpeakers.filter((a) => a.address !== address);
      return { ...state, listeners, onlineSpeakers };
    },
    saveAudioEnable(state, { payload: { audioEnable } }) {
      return { ...state, audioEnable };
    },
    saveOnlineSpeakers(state, { payload: { onlineSpeakers } }) {
      return { ...state, onlineSpeakers };
    },
    addListener(state, { payload: { listener } }) {
      console.log(JSON.stringify(state.listeners));
      console.log(JSON.stringify(listener));
      const listeners = state.listeners.concat(listener);
      console.log(JSON.stringify(listeners));
      return { ...state, listeners };
    },
    addOnlineSpeakers(state, { payload: { speaker } }) {
      console.log(JSON.stringify(state.onlineSpeakers));
      console.log(JSON.stringify(speaker));
      const onlineSpeakers = state.onlineSpeakers.concat(speaker);
      console.log(JSON.stringify(onlineSpeakers));
      return { ...state, onlineSpeakers};
    },
    setServer(state, { payload: { meetingServer } }) {
      return { ...state, meetingServer };
    },
  }
};
