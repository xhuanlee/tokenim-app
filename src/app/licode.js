import { AGORA_APP_ID } from '@/app/constant';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {createToken} from '../pages/home/content/LicodeClient';

const Erizo = require('../pages/home/content/erizo');
const serverUrl = 'https://t.callt.net:3001/';
let localStream;
let localStreamid;
let room;
let recording = false;
let recordingId = '';
const configFlags = {
  noStart: false, // disable start button when only subscribe
  forceStart: true, // force start button in all cases
  screen: false, // screensharinug
  room: '会客室', // 'basicExampleRoom', // room name
  //  roomId:'6180dae0d4edf07e00e3d70a',// node 001 - aliyun
  roomId: '618e850a0a18f32177d55a80', // node 002 - aws
  singlePC: false,
  type: 'erizo', // room type
  onlyAudio: true,
  mediaConfiguration: 'default',
  onlySubscribe: false,
  onlyPublish: false,
  autoSubscribe: false,
  simulcast: false,
  unencrypted: false,
  data: true,
  microphone: true,
  camera: false,
};

export async function initChannel(isHost,agoraObject, channel, address ) {
//  await joinChannel(agoraObject, channel, address);
  console.log(isHost+":"+agoraObject.roomname+":"+channel+":"+address)
  const roomData = { username: address,
    role: 'presenter',
    room: agoraObject.roomname,
    roomId: channel,
    type: configFlags.type,
    mediaConfiguration: configFlags.mediaConfiguration };
  createToken(roomData,(response)=>{
    const token = response;
    console.log(token);
    if (token=="")
      return;
    room = Erizo.Room({ token });
    room.connect();
    room.addEventListener('room-connected', (roomEvent) => {
      console.log(JSON.stringify(roomEvent));
      createLocalAndPublishAudio(agoraObject, isHost);
    });
    room.addEventListener('room-disconnected', (roomEvent) => {
      console.log(JSON.stringify(roomEvent));
    });
  })
}

export async function joinChannel(agoraObject, channel, address) {
  console.log('agora join channel: ', channel);
  await agoraObject.client.join(AGORA_APP_ID, channel, null, address);
}

export async function createLocalAndPublishAudio(agoraObject, isHost) {
  console.log('agora user create and publish');
  const config = {
    audio: configFlags.microphone, //! configFlags.onlySubscribe,//true,
    video: configFlags.camera, //! configFlags.onlyAudio,
    data: configFlags.data, // true,
    screen: configFlags.screen,
    attributes: {
      nickname: agoraObject.client.name,
      actualName: agoraObject.client.name,
      avatar: 1333,
      id: agoraObject.client.address,
      name: agoraObject.client.name,
      speaker: !configFlags.onlySubscribe
    }
  };
  Erizo.Logger.setLogLevel(Erizo.Logger.TRACE);
  const localStream = Erizo.Stream(config);
  localStream.addEventListener('access-accepted', () => {
    room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 }, (id, error) => {
      if (id === undefined) {
        console.log('Error publishing stream', error);
        window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: false } });
      } else {
        console.log('Published stream', id);
      }
    });
    localStream.show('myAudio');
    localStream.addEventListener('stream-data', (evt) => {
      console.log('Received data ', evt.msg, 'from stream ', evt.stream.getAttributes().name);
      // $('#messages').append($('<li>').text(evt.msg));
    });
  });
  localStream.addEventListener('access-denied', () => {
    //        room.connect({ singlePC: configFlags.singlePC });
    //        localStream.show('myVideo');
    console.log('access-denied');
    //          room.disconnect();
  });
  localStream.init();

  // const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  // agoraObject.localAudioTrack = localAudioTrack;
  // await agoraObject.client.publish([localAudioTrack]);
  // if (!isHost) {
  //   await localAudioTrack.setEnabled(false);
  //   window.g_app._store.dispatch({ type: 'clubhouse/saveAudioEnable', payload: { audioEnable: false } });
  // }
}

export async function userPublishedEvent(agoraObject, user, mediaType) {
  console.log('agora user published: ', user);
  await agoraObject.client.subscribe(user, mediaType);
  if (mediaType === 'audio') {
    const remoteAudioTrack = user.audioTrack;
    remoteAudioTrack.play();
  }
}

export function userJoinedEvent(user) {
  console.log('agora user join: ', user);
  window.g_app._store.dispatch({ type: 'clubhouse/userJoin', payload: { address: user.uid } });
}

export function userLeftEvent(user, reason) {
  console.log('agora user left: ', user, reason);
  window.g_app._store.dispatch({ type: 'clubhouse/userLeft', payload: { address: user.uid } });
}

export async function leaveCall(agoraObject) {
  console.log('licode user leave');
  // agoraObject.localAudioTrack && agoraObject.localAudioTrack.close();
  // await agoraObject.client.leave();
  window.g_app._store.dispatch({ type: 'clubhouse/saveListeners', payload: { listeners: [] } });
}
