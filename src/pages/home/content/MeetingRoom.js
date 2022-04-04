import React, { useEffect, useCallback } from 'react';
import { connect } from 'dva';
import AgoraRTC from 'agora-rtc-sdk-ng';
import style from '../../ClubHouse.less';
import { AudioOutlined, AudioMutedOutlined, StopOutlined } from '@ant-design/icons';
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
import { isHost } from '@/service/licodeclient';
import { enterRoom } from './LicodeClient';

const CHANNEL_PREFIX = 'meetingroom';

const agoraObject = {
  client: null,
  localAudioTrack: null,
};

const MeetingRoom = props => {
  const { dispatch, id, currentRoom, listeners, user, account, audioEnable, onlineSpeakers,meetingServer } = props;

  useEffect(() => {
    if (!currentRoom || !currentRoom._id) {
      dispatch({ type: 'meetingroom/fetchRoom', payload: { id } });
      return;
    }

    const isAHost = isHost(currentRoom, user && user.address);
    const role = isAHost ? 'host' : 'audience';
    agoraObject.roomname = currentRoom.name;
    agoraObject.meetingServer = meetingServer;
    //    enterRoom(user.address,currentRoom.name,id);
    //    initChannel(isAHost, agoraObject, `${CHANNEL_PREFIX}_${currentRoom.id}`, user.address);
    agoraObject.client = user;
    agoraObject.account = account;
    initChannel(isAHost, agoraObject, currentRoom._id, user && user.address);
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
  }, [account, currentRoom, dispatch, id, meetingServer, user]);
  //, [currentRoom, dispatch, id, user.address]);

  useEffect(() => {
    dispatch({ type: 'meetingroom/userJoin', payload: { address: user && user.address } });
    return () => {
      dispatch({ type: 'meetingroom/userLeft', payload: { address: user && user.address } });
    };
  }, [dispatch, user]);
  //}, [dispatch, user.address]);
  const toggleAudioEnable = useCallback(() => {
//    agoraObject.localAudioTrack.setEnabled(!audioEnable);
    talkMode(!audioEnable);
    dispatch({ type: 'meetingroom/saveAudioEnable', payload: { audioEnable: !audioEnable } });
  }, [audioEnable, dispatch]);

  const stopConference = ()=>{
    leaveCall(agoraObject);
    dispatch({ type: 'meetingroom/stopConference', payload: { } });
  };
  const { title, moderators, speakers } = currentRoom || {};

  return (
    <div className={style.roomTitleContainer}>
      <script type="text/javascript" src="erizo.js"></script>
      <div style={{backgroundColor:'lightgrey'}}>
        <h1 style={{margin:10}}>
          {title}
          {audioEnable ? (
            <Tooltip title="mute">
              <Button size="large" type="link" onClick={toggleAudioEnable} style={{marginLeft:"70%" }}>
                <AudioMutedOutlined style={{ fontSize: '24px'}} />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="unmute">
              <Button size="large" type="link" onClick={toggleAudioEnable} style={{marginLeft:"70%" }}>
                <AudioOutlined style={{ fontSize: '24px'}} />
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Stop">
            <Button size="large" type="link" onClick={stopConference}>
              <StopOutlined style={{ fontSize: '24px' ,color:'red'}} />
            </Button>
          </Tooltip>
        </h1>
      </div>
      <div className={style.userContainer}>
        <h2 style={{margin:10}}>Speakers</h2>
        <div style={{margin:10}}>
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
        <h2 style={{margin:6}}>listeners</h2>
        {listeners && listeners.map(item => <ClubhouseUserItem user={item} online />)}
      </div>
      {/*<div className={style.userContainer} >*/}
      {/*  <button key="stopButton" id="stopButton" onClick={stopConference}  >End</button>*/}
      {/*  <button key="talkMode" id="talkMode" onClick={()=>{console.log("talkMode()")}} >Mute</button>*/}
      {/*  <button key="cameraMode" id="cameraMode" onClick={()=>{console.log("cameraMode()")}} >Video</button>*/}
      {/*  <button key="recordButton" id="recordButton" onClick={()=>{console.log("startRecording()")}} disabled>Recording*/}
      {/*  </button>*/}
      {/*</div>*/}
    </div>
  );
};

export default MeetingRoom;
