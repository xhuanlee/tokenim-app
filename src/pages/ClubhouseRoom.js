import React, { useEffect, useCallback } from 'react';
import { connect } from 'dva';
import AgoraRTC from 'agora-rtc-sdk-ng';
import style from './ClubHouse.less';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import ClubhouseUserItem from '@/components/ClubhouseUserItem';
import {
  createLocalAndPublishAudio,
  initChannel,
  joinChannel,
  leaveCall,
  userJoinedEvent, userLeftEvent,
  userPublishedEvent,
} from '@/app/agora';
import { Button, Tooltip } from 'antd';
import NeedLogin from '@/pages/home/NeedLogin';
import { isHost } from '@/service/clubhouse';

const CHANNEL_PREFIX = 'club_house';

const agoraObject = {
  client: null,
  localAudioTrack: null,
}

const ClubhouseRoom = (props) => {
  const { dispatch, match: { params: { id } }, currentRoom, listeners, user, audioEnable, onlineSpeakers } = props;

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

  useEffect(() => {
    dispatch({ type: 'clubhouse/userJoin', payload: { address: user.address } });
    return () => {
      dispatch({ type: 'clubhouse/userLeft', payload: { address: user.address } });
    };
  }, []);
  const toggleAudioEnable = useCallback(() => {
    agoraObject.localAudioTrack.setEnabled(!audioEnable);
    dispatch({ type: 'clubhouse/saveAudioEnable', payload: { audioEnable: !audioEnable } });
  }, [audioEnable]);

  const { title, moderators, speakers } = currentRoom || {};

  return (
    <NeedLogin>
      <div className={style.roomTitleContainer}>
        <div>
          <h1>
            {title}
            { audioEnable ?
              <Tooltip title="mute">
                <Button size="large" type="link" onClick={toggleAudioEnable}><AudioMutedOutlined style={{ fontSize: '24px' }} /></Button>
              </Tooltip>
              :
              <Tooltip title="unmute">
                <Button size="large" type="link" onClick={toggleAudioEnable}><AudioOutlined style={{ fontSize: '24px' }} /></Button>
              </Tooltip>
            }
          </h1>
        </div>
        <div className={style.userContainer}>
          <h2>moderators</h2>
          <div>
            {moderators && moderators.map(item => (<ClubhouseUserItem user={item} online={onlineSpeakers.includes(item.address)}  />))}
          </div>
        </div>
        <div className={style.userContainer}>
          <h2>speakers</h2>
          {speakers && speakers.map(item => (<ClubhouseUserItem user={item} online={onlineSpeakers.includes(item.address)} />))}
        </div>
        <div className={style.userContainer}>
          <h2>listeners</h2>
          {listeners && listeners.map(item => (<ClubhouseUserItem user={item} online />))}
        </div>
      </div>
    </NeedLogin>
  );
};

export default connect(state => ({
  currentRoom: state.clubhouse.currentRoom,
  user: state.clubhouse.user,
  listeners: state.clubhouse.listeners,
  audioEnable: state.clubhouse.audioEnable,
  onlineSpeakers: state.clubhouse.onlineSpeakers,
}))(ClubhouseRoom);
