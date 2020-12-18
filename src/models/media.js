export const MediaType = {
  none: undefined,
  video: 'video',
  audio: 'audio',
};

export const MediaStatus = {
  init: 'init',
  invite: 'invite',
  ring: 'ring',
  active: 'active',
  error: 'error',
  connect: 'connecting',
};

const defaultState = {
  type: MediaType.none,
  status: MediaStatus.init,
  chatUser: null,
};

export default {
  namespace: 'media',

  state: defaultState,

  effects: {

  },

  reducers: {
    saveType(state, { payload: { type } }) {
      return { ...state, type };
    },
    saveStatus(state, { payload: { status } }) {
      return { ...state, status };
    },
    saveChatUser(state, { payload: { chatUser } }) {
      return { ...state, chatUser };
    },
  }
};
