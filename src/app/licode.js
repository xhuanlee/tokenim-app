/* eslint-disable */
import { AGORA_APP_ID } from '@/app/constant';
//import AgoraRTC from 'agora-rtc-sdk-ng';
import {createToken} from '../pages/home/content/LicodeClient';

//const Erizo = require('../pages/home/content/erizo');
const serverUrl = 'https://t.callt.net:3001/';
let localStream=null;
let localStreamid=null;
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
  name:'',
  user:null,
  maxSpeakers:10,
};
function addPreZero4(num) {
  return (`0000${num}`).slice(-4);
}
const randomname = addPreZero4(Math.round(Math.random() * 10000));
let speakersInRoom = 0;
let isTalking = false;
let slideShowMode = false;
const subscribeToStreams = (streams) => {
  if (configFlags.autoSubscribe) {
    return;
  }
  if (configFlags.onlyPublish) {
    return;
  }
  const cb = (evt) => {
    console.log('Bandwidth Alert', evt.msg, evt.bandwidth);
  };

  streams.forEach((stream) => {
    if (localStream==null || localStream.getID() !== stream.getID()) {
      if (stream.hasAudio() || stream.hasVideo()) {
        speakersInRoom += 1;
        console.log(`speakersInRoom++:${speakersInRoom}`);
      }
      room.subscribe(stream, {
        slideShowMode,
        metadata: { type: 'subscriber' },
        video: !configFlags.onlyAudio,
        encryptTransport: !configFlags.unencrypted
      });
      //          room.subscribe(stream, { slideShowMode, metadata: { type: 'subscriber',nickname:"web"+name,actualName:"web"+name,avatar:name+"",id:name+"" }, video: !configFlags.onlyAudio, encryptTransport: !configFlags.unencrypted });
      stream.addEventListener('bandwidth-alert', cb);
    } else {
      stream.setAttributes({ actualName: `${configFlags.name}`, avatar: `${randomname}`, name });
    }
  });
};
function processAction(address, options) {
  switch (options.action){
    case 'mute':
      window.g_app._store.dispatch({ type: 'meetingroom/setSpeakerMute', payload: { address: address,muted:options.value } });
      break;
    case 'handup':
//      if (isTalking)
        if (confirm('Give up speaker to others')) {
          localStream.sendData({options:{ action: 'approve', value: true,id:options.id }});
          talkMode(false,true);
        }
      break;
    case 'approve':
      if (!isTalking)
        talkMode(true);
        break;
  }
}
let createTokenInProcess = false;
export async function initChannel(isHost,agoraObject, channel, address ) {
//  await joinChannel(agoraObject, channel, address);
  if (createTokenInProcess)
    return;
  if (room && room.state > 0){
    //room.state to access the current state of the room. States can be 0 if it is disconnected, 1 if it is connecting, and 2 if it is connected.
    console.log('room state:' + room.state)
    return;
  }
  console.log(isHost+":"+agoraObject.roomname+":"+channel+":"+address)
  const roomData = { username: address,
    role: 'presenter',
    room: agoraObject.roomname,
    server:agoraObject.meetingServer,
    roomId: channel,
    type: configFlags.type,
    mediaConfiguration: configFlags.mediaConfiguration };
  createTokenInProcess = true;
  createToken(roomData,(response)=> {
    createTokenInProcess = false;
    const token = response;
    console.log(token);
    if (token == "")
      return;
    if (!Erizo.Room){
      alert("Erizo.Room is Empty" + token)
      return;
    }
      room = Erizo.Room({ token });
    room.connect();
    room.addEventListener('room-connected', (roomEvent) => {
      console.log(JSON.stringify(roomEvent.type)+":"+roomEvent.streams.length);
      speakersInRoom = 0;
      room.addEventListener('stream-subscribed', (streamEvent) => {
        const stream = streamEvent.stream;
        // const div = document.createElement('div');
        // if (!stream.hasVideo()) {
        //   div.setAttribute('style', 'width: 78px; height: 78px;backgroud:yellow;float:left;padding:5px');
        // } else {
        //   div.setAttribute('style', 'width: 320px; height: 240px;backgroud:yellow;float:left;padding-left:5px');
        // }
        // div.setAttribute('id', `test${stream.getID()}`);

        //      div.textContent=stream.getAttributes().actualName+"-"+stream.getAttributes().avatar;
//         if (stream.getAttributes().avatar && stream.hasVideo() === false) {
//           const img = document.createElement('img');
//           img.setAttribute('style', 'border-radius:50%;width: 78px; height: 78px;background:antiquewhite;float:left;');
//           img.setAttribute('id', stream.getAttributes().avatar);
//           img.setAttribute('src', `https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png`);
//           // img.textContent=stream.getAttributes().actualName;
//           div.appendChild(img);
//         }
//         const label = document.createElement('label');
//         label.setAttribute('style', 'width: 78px; font-size:small;text-align:center;');
//         label.textContent = stream.getAttributes().actualName;
//         //        div.appendChild("<label>"+stream.getAttributes().actualName+"</label>");
//         div.appendChild(label);
//         console.log(`${stream.hasVideo()} video appaend:${JSON.stringify(div)}`);
//         if (stream.hasAudio() || stream.hasVideo()) {
// //          document.getElementById('videoContainer').appendChild(div);
// //          stream.show(`test${stream.getID()}`);
//         } else {
//           document.getElementById('listenerContainer').appendChild(div);
//         }
//         if (stream.hasVideo()) {
//           document.getElementById('videoContainer').setAttribute('style', 'background:lightcyan;width:100%;min-height: 260px');
//         }
        console.log(`${stream.getID()}:${JSON.stringify(stream.getAttributes())}`);
//        window.g_app._store.dispatch({ type: 'meetingroom/userJoin', payload: { address: stream.getID() } });
        const {id,avatar,actualName,address,userId,addressId}=stream.getAttributes();
        window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload:{speaker: {stream:stream, id: avatar, nickname:actualName, address: stream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${avatar}.png` } }});

        stream.addEventListener('stream-data', (evt) => {
          const {id,avatar,actualName,address,userId,addressId}=evt.stream.getAttributes();
          console.log('stream Received data ', evt.msg, 'from stream ', evt.stream.getAttributes().address);
          processAction(evt.stream.getID(),evt.msg.options);
          // $('#messages').append($('<li>').text(`${evt.msg.from}:${evt.msg.text}`));
        });
      });
      subscribeToStreams(roomEvent.streams);
      if (configFlags.microphone && speakersInRoom >= configFlags.maxSpeakers) {
        talkMode(false);
        window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: false } });
      }
      else
        createLocalAndPublishAudio(agoraObject, isHost);
    });
    room.addEventListener('room-disconnected', (roomEvent) => {
      console.log(JSON.stringify(roomEvent));
    });
    room.addEventListener('user_connection', (event) => {
      console.log(`${'user_connection:' + ':'}${JSON.stringify(event)}`);
    });
    room.on('user_connection', (event) => {
      console.log(`${'on user_connection:' + ':'}${JSON.stringify(event)}`);
    });

    room.addEventListener('stream-added', (streamEvent) => {
      const streams = [];
      streams.push(streamEvent.stream);
      const stream = streamEvent.stream;
      console.log(`stream-added${stream.getID()}:${JSON.stringify(stream.getAttributes())}`);
      // if (localStream) {
      //   localStream.setAttributes({ type: 'publisher',nickname:"web"+name,actualName:"web"+name,avatar:name+"",id:stream.getID()+"" });
      // }
      subscribeToStreams(streams);
      document.getElementById('recordButton').disabled = false;
      if (localStream && localStream.getID() === stream.getID()) {
        document.getElementById('talkMode').disabled = false;
        isTalking = true;
        localStreamid = stream.getID();
      }
      window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload: {speaker:{stream:stream, nickname:stream.getAttributes().actualName, address: stream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png` }} });
//      window.g_app._store.dispatch({ type: 'meetingroom/userJoin', payload: { address: stream.getID() } });
    });

    room.addEventListener('stream-removed', (streamEvent) => {
      // Remove stream from DOM
      const stream = streamEvent.stream;
      // eslint-disable-next-line no-plusplus
      speakersInRoom--;
      console.log(`speakersInRoom--:${speakersInRoom}`);
      window.g_app._store.dispatch({ type: 'meetingroom/userLeft', payload:{address: stream.getID() }});
      if (stream.elementID !== undefined) {
        const element = document.getElementById(stream.elementID);
        if (element) {
          if (stream.hasAudio || stream.hasVideo()) {
            document.getElementById('videoContainer').removeChild(element);
          } else {
            document.getElementById('listenerContainer').removeChild(element);
          }
        }
      } else {
        const element = document.getElementById(`test${streamEvent.stream.getID()}`);
        if (element) {
          if (stream.hasAudio || stream.hasVideo()) {
            document.getElementById('videoContainer').removeChild(element);
          } else {
            document.getElementById('listenerContainer').removeChild(element);
          }
        }
      }
      console.log(`${stream.getID()}:removed:${JSON.stringify(stream.getAttributes())}`);
      if (localStream)
      if (localStream.getID() === stream.getID() || localStreamid === stream.getID()) {
        const element = document.getElementById('myAudio');
        if (element) {
          if (stream.hasAudio || stream.hasVideo()) {
            document.getElementById('videoContainer').removeChild(element);
          } else {
            document.getElementById('listenerContainer').removeChild(element);
          }
        }
        //        document.getElementById('talkMode').disabled = true;
        isTalking = false;
      }
    });

    room.addEventListener('stream-failed', (evt) => {
      console.log('Stream Failed, act accordingly');
      console.log(JSON.stringify(evt));
    });
  })
}

export async function joinChannel(agoraObject, channel, address) {
  console.log('agora join channel: ', channel);
  await agoraObject.client.join(AGORA_APP_ID, channel, null, address);
}

export async function createLocalAndPublishAudio(agoraObject, isHost) {
  console.log('licode user create and publish');
  const config = {
    audio: configFlags.microphone, //! configFlags.onlySubscribe,//true,
    video: configFlags.camera, //! configFlags.onlyAudio,
    data: configFlags.data, // true,
    screen: configFlags.screen,
    attributes: {
      nickname: agoraObject.client.nickname,
      actualName: agoraObject.client.nickname,
      avatar: randomname,
      id: agoraObject.client.address,
      name: agoraObject.client.nickname,
      speaker: !configFlags.onlySubscribe
    }
  };
  configFlags.name=agoraObject.client.name;
  configFlags.user=agoraObject;
  Erizo.Logger.setLogLevel(Erizo.Logger.TRACE);
  localStream = Erizo.Stream(config);
  localStream.addEventListener('access-accepted', () => {
    room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 }, (id, error) => {
      if (id === undefined) {
        console.log('Error publishing stream', error);
        window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: false } });
      } else {
        console.log('Published stream', id);
        let stream=localStream;
        window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload: {speaker:{ nickname:stream.getAttributes().actualName, address: stream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png` }} });
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
    window.g_app._store.dispatch({ type: 'meetingroom/addListener', payload: {listener:{ nickname:agoraObject.client.nickname, address: agoraObject.client.address,avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${randomname}.png` }} });
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
  window.g_app._store.dispatch({ type: 'meetingroom/userJoin', payload: { address: user.uid } });
}

export function userLeftEvent(user, reason) {
  console.log('agora user left: ', user, reason);
  window.g_app._store.dispatch({ type: 'meetingroom/userLeft', payload: { address: user.uid } });
}
function stopConference() {
  if (room) {
    if (isTalking && localStream.getID()) { room.unpublish(localStream); }
    //    room.unsubscribe();
    room.disconnect();
  }
}

export async function leaveCall(agoraObject) {
  console.log('licode user leave');
  stopConference();
  // agoraObject.localAudioTrack && agoraObject.localAudioTrack.close();
  // await agoraObject.client.leave();
  window.g_app._store.dispatch({ type: 'meetingroom/saveListeners', payload: { listeners: [] } });
}

export function talkMode(audioEnable,giveupSpaker) {
  if (audioEnable && !configFlags.microphone && !localStream.hasAudio() && localStream.getID()) {
    if (speakersInRoom>=configFlags.maxSpeakers){
      alert(`Too many speakers(${speakersInRoom}), ask others to release please wait`);
      localStream.sendData({options:{action:'handup',value:true,id:localStream.getID()}});
      return;
    }
    // data only publisher
    configFlags.microphone = true;
//    document.getElementById('microphone').checked = configFlags.microphone;
    room.unpublish(localStream, (event) => {
      console.log(JSON.stringify(event));
    });
    localStream.close();
    const config = { audio: configFlags.microphone, //! configFlags.onlySubscribe,//true,
      video: configFlags.camera, //! configFlags.onlyAudio,
      data: configFlags.data, // true,
      screen: configFlags.screen,
      attributes: { nickname: `${configFlags.name}`, actualName: `${configFlags.name}`, avatar: `${randomname}`, id: `${configFlags.user.client.address}`, name: `${configFlags.name}`, speaker: !configFlags.onlySubscribe } };
    localStream = Erizo.Stream(config);
    window.localStream = localStream;
    localStream.addEventListener('access-accepted', () => {
      room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 }, (id, error) => {
        if (id === undefined) {
          console.log('Error publishing stream', error);
        } else {
          window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: audioEnable } });
          console.log('Published stream', id);
          window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload: {speaker:{ nickname:localStream.getAttributes().actualName, address: localStream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${localStream.getAttributes().avatar}.png` }} });
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
    return;
  }

  if (localStream && localStream.hasAudio())
  if (!audioEnable && !localStream.audioMuted) {
    isTalking = false;
    configFlags.microphone = false;
    localStream.muteAudio(true);
    localStream.sendData({options:{action:'mute',value:true}});
//    document.getElementById('talkMode').textContent = 'Cancel Mute';
    console.log("speakersInRoom is "+speakersInRoom);
    if (speakersInRoom<=configFlags.maxSpeakers && !giveupSpaker) {
//      document.getElementById('microphone').checked = configFlags.microphone;
      return;
    }
    room.unpublish(localStream, (event) => {
      console.log(JSON.stringify(event));
      let stream = localStream;
      window.g_app._store.dispatch({ type: 'meetingroom/addListener', payload: {listener:{ nickname:stream.getAttributes().actualName, address: stream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png` }} });
      localStream.close();
      const config = { audio: configFlags.microphone, //! configFlags.onlySubscribe,//true,
        video: configFlags.camera, //! configFlags.onlyAudio,
        data: configFlags.data, // true,
        screen: configFlags.screen,
        attributes: { nickname: `${configFlags.name}`, actualName: `${configFlags.name}`, avatar: `${randomname}`, id: `${configFlags.user.client.address}`, name: `${configFlags.name}`, speaker: !configFlags.onlySubscribe } };
      localStream = Erizo.Stream(config);
      window.localStream = localStream;
      localStream.init();
      isTalking=false;
      room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 }, (id, error) => {
        if (id === undefined) {
          console.log('Error publishing stream', error);
        } else {
          console.log('data only Published stream', id);
          window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: audioEnable } });
          window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload: {speaker:{ nickname:localStream.getAttributes().actualName, address: localStream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png` }} });
        }
      });
//      localStream.show('myAudio');
      localStream.addEventListener('stream-data', (evt) => {
        console.log('Received data ', evt.msg, 'from stream ', evt.stream.getAttributes().name);
        // $('#messages').append($('<li>').text(evt.msg));
      });
    });
  } else if (audioEnable && localStream.hasAudio()) {
    // room.publish(localStream);
    //    configFlags.microphone = true;
    localStream.muteAudio(false);
    localStream.sendData({options:{action:'mute',value:false}});
    window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: audioEnable } });
    console.log('audioEnable:'+audioEnable);
    //    isTalking=true;
    //document.getElementById('talkMode').textContent = 'Mute';
  }
  if (!localStream){
    if (speakersInRoom>=configFlags.maxSpeakers){
      configFlags.microphone = false;
      alert(`Too many speakers(${speakersInRoom}), ask others to release please wait`);
//      audioEnable = false;
    }
    else
      configFlags.microphone = audioEnable;
    const config = { audio: configFlags.microphone, //! configFlags.onlySubscribe,//true,
      video: configFlags.camera, //! configFlags.onlyAudio,
      data: configFlags.data, // true,
      screen: configFlags.screen,
      attributes: { nickname: `${configFlags.name}`, actualName: `${configFlags.name}`, avatar: `${randomname}`, id: `${configFlags.user.client.address}`, name: `${configFlags.name}`, speaker: !configFlags.onlySubscribe } };
    localStream = Erizo.Stream(config);
    window.localStream = localStream;
    localStream.init();
    isTalking=false;
    room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 }, (id, error) => {
      if (id === undefined) {
        console.log('Error publishing stream', error);
      } else {
        console.log('data only Published stream', id);
        window.g_app._store.dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: configFlags.microphone } });
        if (audioEnable && configFlags.microphone==false)
          localStream.sendData({options:{action:'handup',value:true,id:localStream.getID()}});

          window.g_app._store.dispatch({ type: 'meetingroom/addOnlineSpeakers', payload: {speaker:{ nickname:localStream.getAttributes().actualName, address: localStream.getID(),avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${stream.getAttributes().avatar}.png` }} });
      }
    });
//      localStream.show('myAudio');
    localStream.addEventListener('stream-data', (evt) => {
      console.log('Received data ', evt.msg, 'from stream ', evt.stream.getAttributes().name);
      // $('#messages').append($('<li>').text(evt.msg));
    });
  }
  //document.getElementById('microphone').checked = configFlags.microphone;
}
function cameraMode() {
  if (configFlags.camera) {
    if (localStream.videoMuted) {
      localStream.muteVideo(false);
      document.getElementById('cameraMode').textContent = 'Close Camera';
    } else {
      //    configFlags.onlyAudio = true;
      localStream.muteVideo(true);
      document.getElementById('cameraMode').textContent = 'Open Camera';
    }
  }
}
function onChangeCheckbox(el) {
  switch (el.value) {
    case '1':
      configFlags.microphone = el.checked;
      break;
    case '2':
      configFlags.camera = el.checked;
      break;
    case '3':
      configFlags.data = el.checked;
      break;
    case '4':
      configFlags.music = el.checked;
      break;
    default:
      break;
  }
}
