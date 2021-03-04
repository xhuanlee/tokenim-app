import { fetchMoreRoom, fetchUser, saveChatRoom, saveUser } from '@/service/clubhouse';

const defaultState = {
  rooms: [],
  listeners: [],
  totalRoom: 0,
  currentRoom: null,
  hasMore: true,
  user: null,
  needCreate: false,
  newChatRoomModal: false,
  page: 1,
};

const INIT_SIZE = 20;
const PAGE_SIZE = 5;
const morePage = INIT_SIZE / PAGE_SIZE + 1;

export default {
  namespace: 'clubhouse',

  state: defaultState,

  effects: {
    *fetchMore(_, { call, put, select }) {
      const page = yield select(state => state.clubhouse.page);
      const response = yield call(fetchMoreRoom, page, PAGE_SIZE);
      const { code, data } = response;
      if (code && code == 200) {
        const oldRooms = yield select(state => state.clubhouse.rooms);
        const rooms = oldRooms.concat(data.list);
        yield put({ type: 'saveRooms', payload: { rooms } });
        yield put({ type: 'saveTotalRoom', payload: { totalRoom: data.total } });
        yield put({ type: 'savePage', payload: { page: page + 1 } });
        if (page >= Math.ceil(data.total / PAGE_SIZE)) {
          yield put({ type: 'saveHasMore', payload: { hasMore: false } });
        }
      }
    },
    *fetchRooms(_, { call, put }) {
      const response = yield call(fetchMoreRoom, 1, 20);
      const { code, data } = response;
      if (code && code == 200) {
        yield put({ type: 'savePage', payload: { page: morePage } });
        yield put({ type: 'saveRooms', payload: { rooms: data.list } });
        yield put({ type: 'saveTotalRoom', payload: { totalRoom: data.total } });
        if (morePage >= Math.ceil(data.total / PAGE_SIZE)) {
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
      const response = yield call(fetchUser, address);
      const oldListeners = yield select(state => state.clubhouse.listeners);
      const { code, data } = response;
      if (code && code === 200) {
        const listeners = [ data.entry, ...oldListeners ];
        yield put({ type: 'saveListeners', payload: { listeners } });
      }
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
      return { ...state, listeners };
    },
  }
};
