import React, { useEffect, useCallback } from 'react';
import { connect } from 'dva';
import AgoraRTC from 'agora-rtc-sdk-ng';
import style from './ClubHouse.less';
import ClubhouseUserItem from '@/components/ClubhouseUserItem';
import {
  createLocalAndPublishAudio,
  initChannel,
  joinChannel,
  leaveCall,
  userJoinedEvent, userLeftEvent,
  userPublishedEvent,
} from '@/app/agora';

const CHANNEL_PREFIX = 'club_house';

const isHost = (room, address) => {
  if (room && room.moderators) {
    for (let i = 0; i < room.moderators.length; i++) {
      if (address === room.moderators[i].address) {
        return true;
      }
    }
  }

  if (room && room.speakers) {
    for (let i = 0; i < room.speakers.length; i++) {
      if (address === room.speakers[i].address) {
        return true;
      }
    }
  }

  return false;
};

const agoraObject = {
  client: null,
  localAudioTrack: null,
}

const ClubhouseRoom = (props) => {
  const { dispatch, match: { params: { id } }, currentRoom, listeners, user } = props;

  useEffect(() => {
    if (!currentRoom || !currentRoom.id) {
      dispatch({ type: 'clubhouse/fetchRoom', payload: { id } });
      return;
    }

    const isAHost = isHost(currentRoom, user.address);
    const role = isAHost ? 'host' : 'audience';
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    agoraObject.client = client;

    client.on('user-published', (user, mediaType) => userPublishedEvent(agoraObject, user, mediaType));
    client.on('user-joined', userJoinedEvent);
    client.on('user-left', userLeftEvent);
    initChannel(isAHost, agoraObject, `${CHANNEL_PREFIX}_${currentRoom.id}`, user.address);

    return () => {
      leaveCall(agoraObject);
    }
  }, []);

  const { title, moderators, speakers } = currentRoom || {};

  return (
    <div className={style.roomTitleContainer}>
      <div>
        <h1>{title}</h1>
      </div>
      <div className={style.userContainer}>
        <h2>moderators</h2>
        <div>
          {moderators && moderators.map(item => (<ClubhouseUserItem user={item} />))}
        </div>
      </div>
      <div className={style.userContainer}>
        <h2>speakers</h2>
        {speakers && speakers.map(item => (<ClubhouseUserItem user={item} />))}
      </div>
      <div className={style.userContainer}>
        <h2>listeners</h2>
        {listeners && listeners.map(item => (<ClubhouseUserItem user={item} />))}
      </div>
    </div>
  );
};

export default connect(state => ({
  currentRoom: state.clubhouse.currentRoom,
  user: state.clubhouse.user,
  listeners: state.clubhouse.listeners,
}))(ClubhouseRoom);
