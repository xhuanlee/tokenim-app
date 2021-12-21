import React, { useEffect, useCallback } from 'react';
import { connect } from 'dva';
import AgoraRTC from 'agora-rtc-sdk-ng';
import style from '../../ClubHouse.less';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import ClubhouseUserItem from '@/components/ClubhouseUserItem';
import {
  createLocalAndPublishAudio,
  initChannel,
  joinChannel,
  leaveCall,
  userJoinedEvent,
  userLeftEvent,
  userPublishedEvent,
  talkMode
} from '@/app/licode';
import { Button, Tooltip } from 'antd';
import NeedLogin from '@/pages/home/NeedLogin';
import { isHost } from '@/service/clubhouse';
import { enterRoom } from './LicodeClient';

const CHANNEL_PREFIX = 'meetingroom';

const agoraObject = {
  client: null,
  localAudioTrack: null,
};

const MeetingRoom = props => {
  const { dispatch, id, currentRoom, listeners, user, audioEnable, onlineSpeakers } = props;

  useEffect(() => {
    if (!currentRoom || !currentRoom._id) {
      dispatch({ type: 'meetingroom/fetchRoom', payload: { id } });
      return;
    }

    const isAHost = isHost(currentRoom, user.address);
    const role = isAHost ? 'host' : 'audience';
    agoraObject.roomname = currentRoom.name;
    //    enterRoom(user.address,currentRoom.name,id);
    //    initChannel(isAHost, agoraObject, `${CHANNEL_PREFIX}_${currentRoom.id}`, user.address);
    agoraObject.client = user;
    initChannel(isAHost, agoraObject, currentRoom._id, user.address);
    return () => {
      leaveCall(agoraObject);
    };
    // const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    // agoraObject.client = client;
    //
    // client.on('user-published', (user, mediaType) => userPublishedEvent(agoraObject, user, mediaType));
    // client.on('user-joined', userJoinedEvent);
    // client.on('user-left', userLeftEvent);
    // initChannel(isAHost, agoraObject, `${CHANNEL_PREFIX}_${currentRoom.id}`, user.address);
    //
    // return () => {
    //   leaveCall(agoraObject);
    // }
  }, [currentRoom, dispatch, id, user]);
  //, [currentRoom, dispatch, id, user.address]);

  useEffect(() => {
    dispatch({ type: 'meetingroom/userJoin', payload: { address: user.address } });
    return () => {
      dispatch({ type: 'meetingroom/userLeft', payload: { address: user.address } });
    };
  }, [dispatch, user.address]);
  //}, [dispatch, user.address]);
  const toggleAudioEnable = useCallback(() => {
//    agoraObject.localAudioTrack.setEnabled(!audioEnable);
    dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: !audioEnable } });
  }, [audioEnable, dispatch]);

  const stopConference = ()=>{
    leaveCall(agoraObject);
    dispatch({ type: 'meetingroom/stopConference', payload: { } });
  };
  const { title, moderators, speakers } = currentRoom || {};

  return (
    <NeedLogin>
      <div className={style.roomTitleContainer}>
        <script type="text/javascript" src="erizo.js"></script>
        <div>
          <h1>
            {title}
            {audioEnable ? (
              <Tooltip title="mute">
                <Button size="large" type="link" onClick={toggleAudioEnable}>
                  <AudioMutedOutlined style={{ fontSize: '24px' }} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="unmute">
                <Button size="large" type="link" onClick={toggleAudioEnable}>
                  <AudioOutlined style={{ fontSize: '24px' }} />
                </Button>
              </Tooltip>
            )}
          </h1>
        </div>
        <div className={style.userContainer}>
          <h2>Speakers</h2>
          <div>
            {onlineSpeakers &&
            onlineSpeakers.map(item => (
                <ClubhouseUserItem user={item} online />
              ))}
          </div>
        </div>
        {/*<div className={style.userContainer} id="videoContainer" >*/}
        {/*  <h2>speakers</h2>*/}
        {/*  {speakers &&*/}
        {/*    speakers.map(item => (*/}
        {/*      <ClubhouseUserItem user={item} online />*/}
        {/*    ))}*/}
        {/*</div>*/}
        <div className={style.userContainer}  id="listenerContainer">
          <h2>listeners</h2>
          {listeners && listeners.map(item => <ClubhouseUserItem user={item} online />)}
        </div>
        <div className={style.userContainer} >
          <button key="stopButton" id="stopButton" onClick={stopConference}  >End</button>
          <button key="talkMode" id="talkMode" onClick={()=>{console.log("talkMode()")}} >Mute</button>
          <button key="cameraMode" id="cameraMode" onClick={()=>{console.log("cameraMode()")}} >Video</button>
          <button key="recordButton" id="recordButton" onClick={()=>{console.log("startRecording()")}} disabled>Recording
          </button>
        </div>
      </div>
    </NeedLogin>
  );
};

export default MeetingRoom;
