import { AGORA_APP_ID } from '@/app/constant';
import AgoraRTC from 'agora-rtc-sdk-ng';

export async function initChannel(isHost,agoraObject, channel, address ) {
  await joinChannel(agoraObject, channel, address);
  if (isHost) {
    await createLocalAndPublishAudio(agoraObject);
  }
}

export async function joinChannel(agoraObject, channel, address) {
  console.log('agora join channel: ', channel);
  await agoraObject.client.join(AGORA_APP_ID, channel, null, address);
}

export async function createLocalAndPublishAudio(agoraObject) {
  console.log('agora user create and publish');
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  agoraObject.localAudioTrack = localAudioTrack;
  await agoraObject.client.publish([localAudioTrack]);
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
  console.log('agora user leave');
  agoraObject.localAudioTrack && agoraObject.localAudioTrack.close();
  await agoraObject.client.leave();
  window.g_app._store.dispatch({ type: 'clubhouse/saveListeners', payload: { listeners: [] } });
}
