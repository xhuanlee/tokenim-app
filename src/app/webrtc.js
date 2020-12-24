import { MediaType } from '../models/media';

export const SignalType = {
  invite: 'invite',
  invite_reply: 'invite_reply',
  reject: 'reject',
  accept: 'accept',
  hangup: 'hangup',
  offer: 'offer',
  answer: 'answer',
  candidate: 'candidate',
  candidateRemoval: 'candidate-removal',
};

export const AudioOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0,
  voiceActivityDetection: false,
};

export const VideoOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
  voiceActivityDetection: false,
};

export const WebrtcConfig = {
  iceServers: [
    {"urls": ["stun:gfax.net:3478"]},
    {"urls": ["turn:gfax.net:3478"], "username":"allcom","credential":"allcompass"}
  ],
};

export function getSDPOptions(mediaType) {
  return (mediaType === MediaType.video) ? VideoOptions : AudioOptions;
}

export function getUserMediaOptions(mediaType) {
  return {
    audio: true,
    video: (mediaType === MediaType.video),
  };
}

function send(publicKey, message) {
  const time = new Date().getTime();
  window.App.sendShhMessage(publicKey, JSON.stringify(message), time);
}

function sendGroup(symKeyId, message) {
  const time = new Date().getTime();
  window.App.sendShhSymMessage(symKeyId, JSON.stringify(message), time)
}

export function sendOffer(myEns, myShhPubKey, myAddress, publicKey, sdp) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.offer,
    content: sdp,
  }

  send(publicKey, message);
}

export function sendAnswer(myEns, myShhPubKey, myAddress, publicKey, sdp) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.answer,
    content: sdp,
  }

  send(publicKey, message);
}

export function sendCandidate(myEns, myShhPubKey, myAddress, publicKey, candidate) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.candidate,
    content: candidate,
  }

  send(publicKey, message);
}

export function sendCandidateRemoval(myEns, myShhPubKey, myAddress, publicKey, candidate) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.candidateRemoval,
    content: candidate,
  }

  send(publicKey, message);
}

export function sendInvite(myEns, myShhPubKey, myAddress, publicKey, mediaType) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.invite,
    content: mediaType,
  }

  send(publicKey, message);
}

export function sendInviteReply(myEns, myShhPubKey, myAddress, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.invite_reply,
  }

  send(publicKey, message);
}

export function sendReject(myEns, myShhPubKey, myAddress, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.reject,
  }

  send(publicKey, message);
}

export function sendAccept(myEns, myShhPubKey, myAddress, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.accept,
  }

  send(publicKey, message);
}

export function sendHangup(myEns, myShhPubKey, myAddress, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.hangup,
  }

  send(publicKey, message);
}

export function createSessionDescription(type, sdp) {
  return new RTCSessionDescription({ sdp, type });
}

export function sendGroupInvite(myEns, myShhPubKey, myAddress, mediaType, symKeyId) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.invite,
    content: mediaType,
    group: true,
  }

  sendGroup(symKeyId, message);
}

export function sendGroupOffer(myEns, myShhPubKey, myAddress, mediaType, sdp, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.offer,
    content: { type: mediaType, sdp },
    group: true,
  }

  send(publicKey, message);
}

export function sendGroupAnswer(myEns, myShhPubKey, myAddress, sdp, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.answer,
    content: sdp,
    group: true,
  }

  send(publicKey, message);
}

export function sendGroupCandidate(myEns, myShhPubKey, myAddress, candidate, publicKey) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.candidate,
    content: candidate,
    group: true,
  }

  send(publicKey, message);
}

export function sendGroupHangup(myEns, myShhPubKey, myAddress, symKeyId) {
  const message = {
    name: myEns,
    shh: myShhPubKey,
    from: myAddress,
    signal: SignalType.hangup,
    group: true,
  }

  sendGroup(symKeyId, message);
}
