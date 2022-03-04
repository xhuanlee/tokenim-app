import React, { Component, createRef } from 'react';
import { connect } from 'dva';
import { Layout, Avatar, List, Modal, Input, Alert, Tooltip, Button, message } from 'antd';
import ReactDraggable from 'react-draggable';
import { formatMessage } from 'umi-plugin-locale';
import {
  LoadingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  UserOutlined,
  UserAddOutlined,
  InteractionOutlined,
  TeamOutlined,
  PhoneOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons';
import router from 'umi/router';
import MyAccountRow from './sider/MyAccountInfo';
import ChatBox from './content/chatbox/ChatBox';
import HomeTab from './HomeTab';
import ERIZO from './content/erizo.js';
import {
  shortenAddress,
  formatTime,
  promiseSleep,
  sendRequest,
  showNotification,
} from '@/app/util';
import { MediaStatus, MediaType } from '@/models/media';
import IMApp from '@/app/index';
import {
  createSessionDescription,
  getSDPOptions,
  getUserMediaOptions,
  sendAccept,
  sendAnswer,
  sendCandidate,
  sendGroupAnswer,
  sendGroupCandidate,
  sendGroupHangup,
  sendGroupInvite,
  sendGroupOffer,
  sendHangup,
  sendInvite,
  sendInviteReply,
  sendOffer,
  sendReject,
  SignalType,
  WebrtcConfig,
} from '@/app/webrtc';
import NeedLogin from '@/pages/home/NeedLogin';
import { saveShhName } from '@/app/metamask';
import MiniProgramList from '@/components/MiniProgramList';
import Defis from '@/pages/home/content/Defis';
import Kademlia from '@/pages/home/content/Kademlia';
import Beagle from '@/pages/home/content/Beagle';
import Chat from '@/pages/home/content/Chat';
import { ETHEREUM_API } from '@/app/constant';
import { routerRedux } from 'dva/router';
import RoomList from '@/pages/home/content/RoomList';
import MeetingRoom from '@/pages/home/content/MeetingRoom';
//import ENS, { getEnsAddress } from '@ensdomains/ensjs';
import Web3 from 'web3';
const ensProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/00a80def04f248feafdc525179f89dbf');
//const ens = new ENS({ ensProvider, ensAddress: getEnsAddress('1') });
var ENS = require('ethereum-ens');
//var Web3 = require('web3');

//var provider = new Web3.providers.HttpProvider();
var ens = new ENS(ensProvider);

var address = ens.resolver('foo.eth').addr().then(function(addr) {console.log('foo.eth:'+addr) });
ens.resolver('beagles.eth').addr().then(function(addr) {console.log('beagles.eth:'+addr) });
const { Content, Sider } = Layout;

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newDialogModal: false,
      newTranferModal: false,

      addFromEns: true,
      ensName: '',
      nameError: '',

      chatAddress: '',
      nickName: '',

      to: '',
      fax: 0,

      disabled: true,

      nameModal: false,
      nameValue: '',
      groupType: null,
      groupCall: [],

      videoEnable: true,
      audioEnable: true,
    };
    this.canAddCandidate = false;
    this.passive = false;
    this.peer = null;
    this.localStream = null;
    this.cacheCandidates = [];

    this.groupPeer = {};
    this.groupShhPubKey = {};
    this.groupCandidate = {};
    this.groupRemoteStream = {};
    // const {loginEns,loginAddress} = this.props.account;
    // if (loginEns && loginEns.length>7 && loginEns[5]=='.' && loginEns[6]=='.' && loginEns[7]=='.') {
    //   this.setState({ nameModal: true });
    //   console.log('nameModal:'+this.state.nameModal);
    // }

    console.log('home_props: ', this.props)
  }

  componentDidMount() {
    // 清除首页样式
    // document.getElementById('container').style = '';
    // document.getElementById('root').style = '';
    if (document.getElementById('AiCoin')) {
      document.getElementById('AiCoin').style.display = 'none';
    }

    this.props.dispatch({ type: 'account/saveEnsName' });
    this.props.dispatch({ type: 'user/getUserInfo' });
    this.props.dispatch({ type: 'contract/getContractInfo' });
    this.props.dispatch({ type: 'user/readChatHistory' });

    const { faxBalance, etherBalance, friends, substrateBalance } = this.props.user;
    const {loginEns,loginAddress} = this.props.account;

    if (loginEns && loginEns.length>7 && loginEns[5]=='.' && loginEns[6]=='.' && loginEns[7]=='.') {
      if (etherBalance<=0)
      // get free 1 Ether to new account
        IMApp.getFreeEther(loginAddress).then(() => {
          console.log('success get ether')
        });
      this.setState({ nameModal: true });
      console.log('nameModal2:'+this.state.nameModal);
    }
    IMApp.setSiganlCallback(this.onSignalMessage);

  }

  componentWillUnmount() {
    // document.getElementById('container').style = 'padding-top: 85px; display: flex; flex-wrap: wrap; justify-content: center; justify-items: center';
    // document.getElementById('root').style = 'width:540px; padding-bottom: 100px';
    // if (document.getElementById('AiCoin')) {
    //   document.getElementById('AiCoin').style.display = 'block'
    // }
  }

  setChatToUser = user => {
    const { dispatch } = this.props;
    dispatch({ type: 'media/saveChatUser', payload: { chatUser: user } });
    const {
      location: {
        query: { s },
      },
    } = this.props;
    if (s) {
      router.push('/home');
    }
  };

  openNewMessageModal = () => {
    this.setState({ newDialogModal: true });
  };
  openNewTransferModal = () => {
    this.setState({ newTranferModal: true });
  };

  confirmTransFax = () => {
    const { to, fax } = this.state;
    this.props.dispatch({ type: 'user/transFax', payload: { to, fax } });
  };

  createDialog = () => {
    const { addFromEns } = this.state;
    if (addFromEns) {
      this.createDialogByEns();
    } else {
      this.createDialogByAddress();
    }
  };

  createDialogByEns = () => {
    const { ensName } = this.state;
    const { queryENSAddress, queryShhPubKey } = this.props.account;
    const time = new Date().getTime();
    if (queryENSAddress && queryShhPubKey) {
      this.props.dispatch({
        type: 'user/addFriend',
        payload: { ensName, friendAddress: queryENSAddress, shhPubKey: queryShhPubKey, time },
      });
      this.setState({ newDialogModal: false });
      this.setChatToUser({ ensName, address: queryENSAddress, shhPubKey: queryShhPubKey, time });
    } else {
      alert(formatMessage({ id: 'home.shh_format_error' }));
    }
  };

  createDialogByAddress = () => {
    const { nickName } = this.state;
    const { queryAddress, queryShhPubKeyByAddress } = this.props.account;
    const time = new Date().getTime();
    if (queryAddress && queryShhPubKeyByAddress) {
      this.props.dispatch({
        type: 'user/addFriend',
        payload: {
          nickName,
          friendAddress: queryAddress,
          shhPubKey: queryShhPubKeyByAddress,
          time,
        },
      });
      this.setState({ newDialogModal: false });
      this.setChatToUser({
        address: queryAddress,
        nickName,
        shhPubKey: queryShhPubKeyByAddress,
        time,
      });
    } else {
      alert(formatMessage({ id: 'home.shh_format_error' }));
    }
  };

  cancelDialogModal = () => {
    this.setState({ newDialogModal: false });
  };
  cancelTransferModal = () => {
    this.setState({ newTranferModal: false });
  };

  openHomeTab = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
    const {
      location: {
        query: { s },
      },
    } = this.props;
    if (s) {
      router.push('/home');
    }
  };

  onENSNameChange = e => {
    const queryENSName = e.target.value;
    if (queryENSName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(queryENSName)) {
      this.setState({ ensName: queryENSName, nameError: '' });
      this.props.dispatch({ type: 'account/getEnsUserData', payload: queryENSName });
    } else {
      this.setState({
        nameError: formatMessage({ id: 'home.ens_name_format_error' }),
        ensName: queryENSName,
      });
    }
  };

  onWhisperChange = e => {
    const publicKey = e.target.value;
    this.props.dispatch({
      type: 'account/saveAccountState',
      payload: { queryShhPubKey: publicKey, queryShhPubKeyByAddress: publicKey },
    });
  };

  onAddressChange = e => {
    const address = e.target.value;
    this.setState({ chatAddress: address });
    if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
      this.props.dispatch({ type: 'account/getAddressUserData', payload: address });
    }
  };

  clearMedia = () => {
    console.log('clearMedia');
    try {
      if (this.peer) {
        this.peer.close();
        this.peer = null;
      }
    } catch (e) {}
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
    } catch (e) {}

    clearInterval(this.checkCallInterval);
  };

  getMediaError = e => {
    console.log('getMediaError: ', e);
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.error } });
    message.error('get media error, please try again', 10);
  };

  toggleAudio = () => {
    if (this.localStream) {
      const { audioEnable } = this.state;
      this.setState({ audioEnable: !audioEnable });
      this.localStream.getAudioTracks().forEach(track => (track.enabled = !audioEnable));
    }
  };

  toggleVideo = () => {
    if (this.localStream) {
      const { videoEnable } = this.state;
      this.setState({ audioEnable: !videoEnable });
      this.localStream.getVideoTracks().forEach(track => (track.enabled = !videoEnable));
    }
  };

  // webrtc:3
  gotLocalStream = async stream => {
    console.log('got local stream: ', stream);
    this.localVideoRef.current.srcObject = stream;
    this.localStream = stream;
    this.localStream.getTracks().forEach(track => this.peer.addTrack(track, this.localStream));
    console.log('Adding Local Stream to peer connection');
    if (this.passive) {
      return;
    }

    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
      type,
    } = media;
    try {
      // webrtc:4
      const offerSdp = await this.peer.createOffer(getSDPOptions(type));
      await this.peer.setLocalDescription(offerSdp);
      sendOffer(loginEns, myShhPubKey, address, shhPubKey, offerSdp.sdp);
    } catch (e) {}
  };

  // webrtc:2
  getLocalMedia = () => {
    console.log('getLocalMedia');
    const {
      media: { type },
    } = this.props;
    navigator.mediaDevices
      .getUserMedia(getUserMediaOptions(type))
      .then(this.gotLocalStream)
      .catch(this.getMediaError);
  };

  // webrtc:6
  onIceCandidate = e => {
    console.log('onIceCandidate');
    if (!e.candidate) {
      return;
    }
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
    } = media;

    sendCandidate(loginEns, myShhPubKey, address, shhPubKey, JSON.stringify(e.candidate));
  };

  onIceCandidateStateChange = e => {
    console.log('onIceCandidateStateChange: ', e);
    if (this.peer.iceConnectionState === 'failed') {
      this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.error } });
      message.error('connect error, please try again', 10);
    } else if (this.peer?.iceConnectionState === 'connected') {
      this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.active } });
    }
  };

  // webrtc:7
  gotRemoteStream = e => {
    console.log('gotRemoteStream');
    if (this.videoRef.current.srcObject !== e.streams[0]) {
      this.videoRef.current.srcObject = e.streams[0];
      console.log('set remote stream success');
    }
  };

  // webrtc:1
  createPeer = () => {
    console.log('createPeer start');
    this.peer = new RTCPeerConnection(WebrtcConfig);
    this.peer.onicecandidate = this.onIceCandidate;
    this.peer.ontrack = this.gotRemoteStream;
    this.peer.oniceconnectionstatechange = this.onIceCandidateStateChange;
    console.log('createPeer end');
  };

  loadCacheCandidate = async () => {
    console.log('loadCacheCandidate');
    if (this.cacheCandidates && this.cacheCandidates.length > 0) {
      for (let i = 0; i < this.cacheCandidates.length; i++) {
        console.log('add cache candidate: ' + i);
        await this.peer.addIceCandidate(this.cacheCandidates[i]);
      }
      this.cacheCandidates = [];
    }
  };

  onReceiveInvite = type => {
    console.log('onReceiveInvite');
    this.passive = true;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.ring } });
    this.props.dispatch({ type: 'media/saveType', payload: { type } });

    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
    } = media;
    sendInviteReply(loginEns, myShhPubKey, address, shhPubKey);
  };

  onReceiveInviteReply = () => {
    console.log('onReceiveInviteReply');
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.wait } });
  };

  onReceiveAccept = async () => {
    console.log('onReceiveAccept');
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.connect } });
    await this.createPeer();
    this.getLocalMedia();
  };

  onReceiveReject = () => {
    console.log('onReceiveReject');
    this.canAddCandidate = false;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
    this.props.dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });
  };

  onReceiveHangup = () => {
    console.log('onReceiveHangup');
    this.passive = false;
    this.canAddCandidate = false;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
    this.props.dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });

    this.clearMedia();
  };

  onReceiveOffer = async sdp => {
    console.log('onReceiveOffer');
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
      type,
    } = media;
    try {
      await this.peer.setRemoteDescription(createSessionDescription('offer', sdp));
      this.canAddCandidate = true;
      await this.loadCacheCandidate();
      const answerSdp = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answerSdp);
      sendAnswer(loginEns, myShhPubKey, address, shhPubKey, answerSdp.sdp);
    } catch (e) {}
  };

  // webrtc:5
  onReceiveAnswer = async sdp => {
    console.log('onReceiveAnswer');
    try {
      await this.peer.setRemoteDescription(createSessionDescription('answer', sdp));
      this.canAddCandidate = true;
      await this.loadCacheCandidate();
    } catch (e) {}
  };

  onReceiveCandidate = async c => {
    console.log('onReceiveCandidate');
    const candidateJson = JSON.parse(c);
    const { candidate, sdpMLineIndex, sdpMid } = candidateJson;
    const candidateObj = new RTCIceCandidate({
      candidate,
      sdpMLineIndex,
      sdpMid,
    });

    if (this.peer) {
      try {
        await this.peer.addIceCandidate(candidateObj);
      } catch (e) {
        console.error('add ice failed: ', e);
        this.cacheCandidates.push(candidateObj);
      }
      return;
    }

    this.cacheCandidates.push(candidateObj);
  };

  onReceiveCandidateRemoval = c => {
    console.log('onReceiveCandidateRemoval');
  };

  getGroupMediaError = (e, from) => {
    console.log('getGroupMediaError: ', e);
  };

  getGroupLocalMedia = async (from, type, createOffer) => {
    console.log(`getGroupLocalMedia: createOffer = ${createOffer}`);
    if (!this.localStream) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(getUserMediaOptions(type));
      } catch (e) {
        console.error('get user media error: ', e);
        return;
      }
    }
    this.localGroupVideoRef.current.srcObject = this.localStream;
    const peer = this.groupPeer[from];
    this.localStream.getTracks().forEach(track => peer.addTrack(track, this.localStream));
    console.log('Adding Local Stream to peer connection');

    if (!createOffer) {
      return;
    }

    console.log(`getGroupLocalMedia: creating offer`);
    const { account } = this.props;
    const { address, shhPubKey: myShhPubKey, loginEns } = account;
    try {
      // webrtc:4
      const offerSdp = await peer.createOffer(getSDPOptions(type));
      await peer.setLocalDescription(offerSdp);
      console.log(`send group offer: {to: ${from}`);
      sendGroupOffer(loginEns, myShhPubKey, address, type, offerSdp.sdp, this.groupShhPubKey[from]);
    } catch (e) {}
  };

  addGroupCacheCandidate = (from, candidate) => {
    if (!this.groupCandidate[from]) {
      this.groupCandidate[from] = [];
    }

    this.groupCandidate[from].push(candidate);
  };

  loadGroupCacheCandidate = async from => {
    console.log('loadGroupCacheCandidate');
    if (this.groupCandidate && this.groupCandidate[from] && this.groupCandidate[from].length > 0) {
      const peer = this.groupPeer[from];
      for (let i = 0; i < this.groupCandidate[from].length; i++) {
        console.log('add group cache candidate: ' + i);
        await peer.addIceCandidate(this.groupCandidate[from][i]);
      }
      delete this.groupCandidate[from];
    }
  };

  // webrtc:6
  onGroupIceCandidate = (e, from) => {
    console.log('onGroupIceCandidate');
    if (!e.candidate) {
      return;
    }
    const { account } = this.props;
    const { address, shhPubKey: myShhPubKey, loginEns } = account;

    sendGroupCandidate(
      loginEns,
      myShhPubKey,
      address,
      JSON.stringify(e.candidate),
      this.groupShhPubKey[from],
    );
  };

  onGroupIceCandidateStateChange = (e, from) => {
    console.log('onGroupIceCandidateStateChange: ', e);
    const peer = this.groupPeer[from];
    if (peer.iceConnectionState === 'failed') {
      // send hangup
    } else if (peer?.iceConnectionState === 'connected') {
      // ...
    }
  };

  // webrtc:7
  gotGroupRemoteStream = (e, from, name) => {
    console.log('gotGroupRemoteStream');
    this.groupRemoteStream[from] = e.streams[0];
    const videoId = `v-${from}`;
    const containerId = `c-${from}`;
    let vEle = document.getElementById(videoId);
    if (vEle) {
      vEle.srcObject = e.streams[0];
      return;
    }

    const cEle = document.createElement('div');
    cEle.id = containerId;
    cEle.style.width = '33%';
    cEle.style.position = 'relative';
    cEle.style.display = 'flex';

    const tEle = document.createElement('p');
    tEle.innerText = name || from;
    tEle.title = from;
    tEle.style.position = 'absolute';
    tEle.style.top = '8px';
    tEle.style.left = '8px';
    tEle.style.width = '100%';
    tEle.style.overflow = 'hidden';
    tEle.style.whiteSpace = 'nowrap';
    tEle.style.textOverflow = 'ellipsis';
    tEle.style.color = '#fff';
    tEle.style.fontSize = '18px';

    vEle = document.createElement('video');
    vEle.id = videoId;
    vEle.autoplay = true;
    vEle.style.width = '100%';

    cEle.appendChild(tEle);
    cEle.appendChild(vEle);
    this.groupVideoContainerRef.current.appendChild(cEle);
    vEle.srcObject = e.streams[0];

    // create video element
    // append video to body
    // set video srcObject current.srcObject = e.streams[0]
  };

  createGroupPeer = (from, name) => {
    console.log('createGroupPeer start');
    const peer = new RTCPeerConnection(WebrtcConfig);
    peer.onicecandidate = e => this.onGroupIceCandidate(e, from);
    peer.ontrack = e => this.gotGroupRemoteStream(e, from, name);
    peer.oniceconnectionstatechange = e => this.onGroupIceCandidateStateChange(e, from);
    this.groupPeer[from] = peer;
    console.log('createGroupPeer end');
  };

  startGroupCall = type => {
    this.setState({ groupType: type });

    const { account } = this.props;
    const { address, shhPubKey: myShhPubKey, symKeyId, loginEns } = account;
    sendGroupInvite(loginEns, myShhPubKey, address, type, symKeyId);
  };

  getGroupType = remoteType => {
    const { groupType } = this.state;
    if (!groupType) {
      return;
    }

    let type = MediaType.video;
    if (groupType === MediaType.audio || remoteType === MediaType.audio) {
      type = MediaType.audio;
    }

    return type;
  };

  onReceiveGroupInvite = (from, name, content) => {
    const type = this.getGroupType(content);
    this.createGroupPeer(from, name);
    this.getGroupLocalMedia(from, type, true);
  };

  sendLocalStream = from => {
    console.log(`ready to send local stream to ${from}`);
    if (from && this.groupPeer[from] && this.localStream) {
      console.log(`send local stream to ${from}`);
      const peer = this.groupPeer[from];
      this.localStream.getTracks().forEach(track => peer.addTrack(track, this.localStream));
    }
  };

  onReceiveGroupOffer = async (from, name, content) => {
    const type = this.getGroupType(content.type);
    this.createGroupPeer(from, name);
    await this.getGroupLocalMedia(from, type);

    const { account } = this.props;
    const { address, shhPubKey: myShhPubKey, loginEns } = account;
    try {
      const peer = this.groupPeer[from];
      await peer.setRemoteDescription(createSessionDescription('offer', content.sdp));
      await this.loadGroupCacheCandidate(from);
      const answerSdp = await peer.createAnswer();
      await peer.setLocalDescription(answerSdp);
      sendGroupAnswer(loginEns, myShhPubKey, address, answerSdp.sdp, this.groupShhPubKey[from]);

      /*
      await promiseSleep(2000);
      peer.getTransceivers().forEach(transceiver => {
        console.log('local sender: ', transceiver.sender);
        transceiver.sender.setStreams(this.localStream);
      });
      */
    } catch (e) {}
  };

  onReceiveGroupIcecandidate = async (from, content) => {
    console.log('onReceiveGroupIcecandidate');
    const candidateJson = JSON.parse(content);
    const { candidate, sdpMLineIndex, sdpMid } = candidateJson;
    const candidateObj = new RTCIceCandidate({
      candidate,
      sdpMLineIndex,
      sdpMid,
    });

    const peer = this.groupPeer[from];
    if (peer) {
      try {
        await peer.addIceCandidate(candidateObj);
      } catch (e) {
        console.error('add ice failed: ', e);
        this.addGroupCacheCandidate(from, candidateObj);
      }
      return;
    }

    this.addGroupCacheCandidate(from, candidateObj);
  };

  onReceiveGroupAnswer = async (from, sdp) => {
    console.log('onReceiveGroupAnswer');
    try {
      const peer = this.groupPeer[from];
      await peer.setRemoteDescription(createSessionDescription('answer', sdp));
      await this.loadGroupCacheCandidate(from);
    } catch (e) {}
  };

  clearGroupMedia = from => {
    console.log('clearGroupMedia');
    try {
      if (!from && Object.keys(this.groupPeer).length > 0) {
        Object.keys(this.groupPeer).forEach(f => {
          try {
            this.groupPeer[f].close();
            delete this.groupPeer[from];
          } catch (e) {}
        });
      } else if (this.groupPeer[from]) {
        this.groupPeer[from].close();
        delete this.groupPeer[from];
      }
    } catch (e) {}
  };

  onReceiveGroupHangup = from => {
    this.clearGroupMedia(from);

    const videoId = `c-${from}`;
    const vEle = document.getElementById(videoId);
    if (vEle) {
      vEle.remove();
    }
  };

  /**
   * 点击group音视频，在本地标记为允许接收来自公共频道的音视频连接，并且广播出去，
   * 其他在线的并且允许音视频连接的账号在收到新的音视频允许连接信号时直接发送offer给发起方
   * */
  onSignalMessage = msg => {
    console.log('receive signal message: ', msg);
    const { groupType } = this.state;
    const { name, from, shh, signal, content, group } = msg;
    const { account } = this.props;
    const { address } = account;
    if ((group && !groupType) || from === address) {
      return;
    }

    if (group) {
      this.groupShhPubKey[from] = shh;
      switch (signal) {
        case SignalType.invite:
          this.onReceiveGroupInvite(from, name, content);
          break;
        case SignalType.offer:
          this.onReceiveGroupOffer(from, name, content);
          break;
        case SignalType.answer:
          this.onReceiveGroupAnswer(from, content);
          break;
        case SignalType.candidate:
          this.onReceiveGroupIcecandidate(from, content);
          break;
        case SignalType.hangup:
          this.onReceiveGroupHangup(from);
          break;
      }
      return;
    }

    this.props.dispatch({
      type: 'user/addFriend',
      payload: { friendAddress: from, ensName: name, shhPubKey: shh, chat: true },
    });

    switch (signal) {
      case SignalType.invite:
        this.onReceiveInvite(content);
        break;
      case SignalType.invite_reply:
        this.onReceiveInviteReply();
        break;
      case SignalType.accept:
        this.onReceiveAccept();
        break;
      case SignalType.hangup:
        this.onReceiveHangup();
        break;
      case SignalType.reject:
        this.onReceiveReject();
        break;
      case SignalType.offer:
        this.onReceiveOffer(content);
        break;
      case SignalType.answer:
        this.onReceiveAnswer(content);
        break;
      case SignalType.candidate:
        this.onReceiveCandidate(content);
        break;
      case SignalType.candidateRemoval:
        this.onReceiveCandidateRemoval(content);
        break;
      default:
        break;
    }
  };

  checkCallStatus = () => {
    console.log('checkCallStatus');
    const { media } = this.props;
    const { status, chatUser } = media;
    if (status === MediaStatus.invite) {
      const msg = formatMessage({ id: 'offline_notice' });
      message.warn(`${chatUser.ensName || chatUser.nickName} ${msg}`);
      return;
    }

    clearInterval(this.checkCallInterval);
  };

  startCall = type => {
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
    } = media;
    sendInvite(loginEns, myShhPubKey, address, shhPubKey, type);

    dispatch({ type: 'media/saveType', payload: { type } });
    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.invite } });

    this.checkCallInterval = setInterval(this.checkCallStatus, 5000);
  };

  acceptInvite = async () => {
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
    } = media;
    sendAccept(loginEns, myShhPubKey, address, shhPubKey);

    await this.createPeer();
    this.getLocalMedia();

    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.connect } });
  };

  endMedia = () => {
    this.passive = false;
    this.canAddCandidate = false;
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const {
      chatUser: { shhPubKey },
      status,
    } = media;
    if (status === MediaStatus.ring) {
      sendReject(loginEns, myShhPubKey, address, shhPubKey);
    } else {
      sendHangup(loginEns, myShhPubKey, address, shhPubKey);
    }

    this.clearMedia();
    dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });
    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
  };

  modifyEnsName = () => {
    const { nameValue } = this.state;
    if (!nameValue || nameValue.trim().length === 0) {
      message.warn('name can not be null');
      return;
    }

//     if (nameValue.endsWith('.eth')){
// //      const ifaddress = ens.name(nameValue).getAddress(); // 0x
//       const { loginAddress } = this.props.account;
//       ens.owner(nameValue).then(addr=>console.log(nameValue+' owner:'+addr));
//       ens.resolver(nameValue).addr().then(function(addr) {
//         console.log(nameValue + ':' + addr);
//         if (addr == loginAddress)
//           alert(nameValue + ":" + addr)
//         else
//           alert(nameValue + " is not yours. It belongs to " + addr)
//       });
//     }
//     else
    // should call registerENS
    sendRequest(
      `${IMApp.API_URL}${ETHEREUM_API.REGISTER_ENS}${this.props.account.address}/${nameValue}`,
      (err, res) => {
        if (err) {
          console.log(`register ens error.`);
          console.log(err);
          showNotification(
            'newAccount',
            'error',
            formatMessage({ id: 'ens_register_error_notice' }),
          );
          window.g_app._store.dispatch({
            type: 'account/saveAccountState',
            payload: { registerENSLoading: false, registerError: true },
          });
        } else if (res.err !== 0) {
          console.log(`register ens error.`);
          console.log(res.msg);
          showNotification('newAccount', 'error', res.msg);
          window.g_app._store.dispatch({
            type: 'account/saveAccountState',
            payload: { registerENSLoading: false, registerError: true },
          });
        } else {
          // IMApp.saveENSToLocal(ensName, address)
          // window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { registerENSLoading: false, registerError: false } })
          // window.g_app._store.dispatch(routerRedux.push('/regSuccess'))

          this.setState({ confirmLoading: true });
          saveShhName(nameValue)
            .then(() => {
              this.setState({ nameModal: false, confirmLoading: false });
            })
            .catch(e => {
              console.error('save shh name error: ', e);
            });

          // get free 1 Ether to new account
          // IMApp.getFreeEther(address).then(() => {
          //   console.log('success get ether')
          // });
        }
      },
    );
  };

  endGroupMedia = () => {
    this.setState({ groupType: null, groupCall: [], audioEnable: true, videoEnable: true });
    this.clearGroupMedia();
    this.groupShhPubKey = {};
    this.groupCandidate = {};
    this.groupRemoteStream = {};

    const { account } = this.props;
    const { address, shhPubKey: myShhPubKey, symKeyId, loginEns } = account;
    sendGroupHangup(loginEns, myShhPubKey, address, symKeyId);

    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
    } catch (e) {}
  };

  render() {
    this.videoRef = createRef();
    this.localVideoRef = createRef();
    this.localGroupVideoRef = createRef();
    this.groupVideoContainerRef = createRef();
    const { media } = this.props;
    const { type: mType, chatUser, status } = media;
    const {
      newDialogModal,
      newTranferModal,
      addFromEns,
      ensName,
      nameError,
      chatAddress,
      nickName,
      groupType,
      videoEnable,
      audioEnable,
    } = this.state;
    const { faxBalance, etherBalance, friends, substrateBalance } = this.props.user;
    const {
      dispatch,
      currentRoom,
      listeners,
      roomUser,
      audioEnable: roomAudioEnable,
      onlineSpeakers,
      loading,
      meetingroom,
      meetingServer,
    } = this.props;
    const {
      queryENSAvaiable,
      queryENSLoading,
      queryENSAddress,
      queryShhPubKey,
      queryShhPubKeyByAddress,
    } = this.props.account;
    const { loginAddress } = this.props.account;

    let callTitleColor = undefined;
    if (status === MediaStatus.active) {
      callTitleColor = '#389e0d';
    }
    if (status === MediaStatus.error) {
      callTitleColor = '#f5222d';
    }

    const errorMessage =
      addFromEns && ensName
        ? nameError
          ? nameError
          : queryENSAvaiable || !ensName
          ? formatMessage({ id: 'home.ens_name_not_register_error' })
          : ''
        : '';
    const queryENSAddressTip =
      queryENSAddress ||
      (queryENSAvaiable ? formatMessage({ id: 'home.ens_name_not_register' }) : '');

    const ensNameCheck = ensName ? (
      queryENSLoading ? (
        <Tooltip title={formatMessage({ id: 'home.searching' })}>
          <LoadingOutlined style={{ color: '#1890ff' }} />
        </Tooltip>
      ) : queryENSAvaiable ? (
        <Tooltip title={formatMessage({ id: 'home.ens_name_not_register' })}>
          <CloseCircleOutlined style={{ color: '#f5222d' }} />
        </Tooltip>
      ) : (
        <Tooltip title={formatMessage({ id: 'home.registered' })}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        </Tooltip>
      )
    ) : null;

    const { s, room } = this.props.location.query;
    let contentBody = (
      <HomeTab
        address={loginAddress}
        token={faxBalance}
        ether={etherBalance}
        substrateBalance={substrateBalance}
      />
    );
    console.log(s,JSON.stringify(this.state));
    switch (s) {
      case 'defi':
        contentBody = <Defis />;
        break;
      case 'kademlia':
//        meetingroom.server='https://t.callt.net:3001/';
        contentBody = <RoomList dispatch={dispatch} loading={loading} meetingroom={meetingroom} server={'https://t.callt.net:3001/'} />;
        break;
      case 'beagle':
//        meetingroom.server='https://meeting.kad.network:3001/';
        contentBody = <RoomList dispatch={dispatch} loading={loading} meetingroom={meetingroom} server={'https://meeting.kad.network:3001/'} />;
        break;
      case 'chat':
        if (roomUser && roomUser.address && roomUser.address.length>0
            && currentRoom && currentRoom._id && currentRoom._id.length>0)
          contentBody = (
            <MeetingRoom
              dispatch={dispatch}
              id={room}
              currentRoom={currentRoom?currentRoom:{_id:room,name:'Beagles'}}
              listeners={listeners}
              user={roomUser && roomUser.address && roomUser.address.length>0?roomUser:{address:this.props.account.address,loginEns:this.props.account.loginEns}}
              meetingServer={meetingServer?meetingServer:'https://t.callt.net:3001/'}
              audioEnable={roomAudioEnable}
              onlineSpeakers={onlineSpeakers}
            />
          );
        else {
                   contentBody=(<RoomList dispatch={dispatch} loading={loading} meetingroom={meetingroom} targetRoom={room} server={'https://t.callt.net:3001/'} />);
          //contentBody = <div>waiting ...</div>
          //dispatch({ type: 'meetingroom/saveCurrentRoom', payload: {currentRoom: { _id:room,name:'Beagles',title:'beagles'}}} );
          console.log(roomUser, currentRoom);
        }
        break;
      default:
        if (chatUser) {
          contentBody = (
            <ChatBox
              chatTo={chatUser}
              startAudio={() => this.startCall(MediaType.audio)}
              startVideo={() => this.startCall(MediaType.video)}
              startGroupAudio={() => this.startGroupCall(MediaType.audio)}
              startGroupVideo={() => this.startGroupCall(MediaType.video)}
            />
          );
        }
    }

    return (
      <NeedLogin location={this.props.location}>
        <div style={{ height: '100vh', backgroundColor: 'rgb(213,216,225)' }}>
          <Layout style={{ height: '100vh', margin: 'auto', backgroundColor: 'rgb(213,216,225)' }}>
            <Sider
              width={200}
              style={{
                margin: '10px 0px',
                backgroundColor: '#ffffff',
                overflowX: 'hidden',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  margin: '5px 0px',
                  display: 'flex',
                  flexDirection: 'row',
                  borderBottom: '1px solid #e8e8e8',
                  borderTop: '1px solid #e8e8e8',
                  height: 50,
                  alignItems: 'center',
                  backgroundColor: 'rgba(40,40,40, 0.7)',
                  color: '#fff',
                }}
              >
                <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #e8e8e8' }}>
                  <HomeOutlined style={{ fontSize: 22 }} onClick={this.openHomeTab} />
                  {/* <p>个人信息页</p> */}
                </div>
                <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #e8e8e8' }}>
                  <UserAddOutlined style={{ fontSize: 22 }} onClick={this.openNewMessageModal} />
                  {/* <p>新建对话</p> */}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <InteractionOutlined
                    style={{ fontSize: 22 }}
                    onClick={this.openNewTransferModal}
                  />
                  {/* <p>发起转账</p> */}
                </div>
              </div>
              <MyAccountRow onClick={() => this.setState({ nameModal: true })} />
              <MiniProgramList />

              {/* public chat */}
              <List.Item
                onClick={() => this.setChatToUser({ isGroup: true })}
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  width: 200,
                  height: 70,
                  borderBottom: '1px solid #e8e8e8',
                  backgroundColor: chatUser && chatUser.isGroup ? '#e6f7ff' : '',
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#40a9ff' }} />}
                  title={formatMessage({ id: 'home.public_room' })}
                  description={formatMessage({ id: 'home.public_description' })}
                />
              </List.Item>

              <List
                itemLayout="horizontal"
                dataSource={friends}
                renderItem={friend => (
                  <List.Item
                    onClick={() => this.setChatToUser(friend)}
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      width: 200,
                      height: 70,
                      backgroundColor:
                        chatUser && chatUser.address === friend.address ? '#e6f7ff' : '',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar>
                          {(friend.ensName && friend.ensName[0]) ||
                            (friend.nickName && friend.nickName[0]) ||
                            '0x'}
                        </Avatar>
                      }
                      title={
                        friend.nickName || friend.ensName || shortenAddress(friend.address, 10)
                      }
                      description={formatTime(friend.time)}
                    />
                  </List.Item>
                )}
              />
            </Sider>
            <Layout
              style={{ overflowY: 'hidden', height: '100vh', backgroundColor: 'rgb(213,216,225)' }}
            >
              <Content style={{ background: '#fff', margin: '10px 3px', overflowY: 'auto' }}>
                {contentBody}
              </Content>
            </Layout>
          </Layout>

          <Modal
            title={formatMessage({ id: 'home.add_dialogue' })}
            visible={newDialogModal}
            onOk={this.createDialog}
            onCancel={this.cancelDialogModal}
            okText={formatMessage({ id: 'add' })}
            cancelText={formatMessage({ id: 'cancel' })}
          >
            <div style={{ display: 'flex' }}>
              <div
                style={{ flex: 1, justifyContent: 'center', display: 'flex', cursor: 'pointer' }}
                onClick={() => this.setState({ addFromEns: true })}
              >
                <div
                  style={{
                    textAlign: 'center',
                    width: 90,
                    color: addFromEns ? 'rgb(24, 144, 255)' : '',
                    borderBottom: addFromEns ? '1px solid rgba(24, 144, 255, 0.5)' : '0px',
                  }}
                >
                  {formatMessage({ id: 'home.ens_username' })}
                </div>
              </div>
              <div
                style={{ flex: 1, justifyContent: 'center', display: 'flex', cursor: 'pointer' }}
                onClick={() => this.setState({ addFromEns: false })}
              >
                <div
                  style={{
                    textAlign: 'center',
                    width: 90,
                    color: !addFromEns ? 'rgb(24, 144, 255)' : '',
                    borderBottom: !addFromEns ? '1px solid rgba(24, 144, 255, 0.5)' : '0px',
                  }}
                >
                  {formatMessage({ id: 'home.wallet_address' })}
                </div>
              </div>
            </div>

            {addFromEns ? (
              <div>
                <div style={{ display: 'flex', margin: '20px 20px 5px 20px' }}>
                  <Input
                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder={formatMessage({ id: 'home.input_other_ens_name' })}
                    addonAfter=".beagles"
                    suffix={ensNameCheck}
                    defaultValue={ensName}
                    width={200}
                    onChange={this.onENSNameChange}
                  />
                </div>
                <div style={{ display: 'flex', margin: '20px 20px 5px 20px' }}>
                  <Input.TextArea
                    placeholder="Please input whisper public key"
                    defaultValue={queryShhPubKey}
                    width={200}
                    onChange={this.onWhisperChange}
                  />
                </div>
                {errorMessage ? (
                  <div style={{ margin: '5px 20' }}>
                    <Alert message={errorMessage} type="error" />
                  </div>
                ) : (
                  <div style={{ margin: '5px 20px' }}>
                    <Alert
                      message={
                        <div>
                          <div>
                            {formatMessage({ id: 'home.alert_address' })}
                            <br />
                            {queryENSAddressTip}
                          </div>
                          <hr style={{ borderBottom: '1px solid #91d5ff', borderTop: '0px' }} />
                          <div>
                            {formatMessage({ id: 'home.alert_shh_pubkey' })} <br />
                            {queryShhPubKey}
                          </div>
                        </div>
                      }
                      type="info"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', margin: 20 }}>
                  <span style={{ width: 80 }}>{formatMessage({ id: 'home.my_nickname' })}</span>
                  <Input
                    placeholder={formatMessage({ id: 'home.set_my_nickname' })}
                    style={{ width: 380 }}
                    onChange={e => this.setState({ nickName: e.target.value })}
                    defaultValue={nickName}
                  />
                </div>
                <div style={{ display: 'flex', margin: '20px 20px 5px' }}>
                  <span style={{ width: 80 }}>
                    地址:<span style={{ color: '#f5222d' }}>*</span>
                  </span>
                  <Input
                    placeholder={formatMessage({ id: 'home.input_other_address' })}
                    style={{ width: 380 }}
                    onChange={this.onAddressChange}
                    defaultValue={chatAddress}
                  />
                </div>
                <div style={{ display: 'flex', margin: '20px 20px 5px' }}>
                  <span style={{ width: 80 }}>
                    Whisper:<span style={{ color: '#f5222d' }}>*</span>
                  </span>
                  <Input.TextArea
                    placeholder="Please input whisper public key"
                    defaultValue={queryShhPubKeyByAddress}
                    width={380}
                    onChange={this.onWhisperChange}
                  />
                </div>

                <div style={{ margin: '20px 20px 20px' }}>
                  <Alert
                    message={
                      <div>
                        <div>
                          {formatMessage({ id: 'home.alert_shh_pubkey' })} <br />
                          {queryShhPubKeyByAddress}
                        </div>
                      </div>
                    }
                    type="info"
                  />
                </div>
              </div>
            )}
          </Modal>

          <Modal
            title={formatMessage({ id: 'home.launch_transfer' })}
            visible={newTranferModal}
            onOk={this.confirmTransFax}
            onCancel={this.cancelTransferModal}
            okText={formatMessage({ id: 'confirm' })}
            cancelText={formatMessage({ id: 'cancel' })}
          >
            <div style={{ display: 'flex', margin: 20 }}>
              <span style={{ width: 100 }}>{formatMessage({ id: 'home.current_balance' })}</span>
              <span>{faxBalance} App</span>
            </div>

            <div style={{ display: 'flex', margin: 20 }}>
              <span style={{ width: 80 }}>{formatMessage({ id: 'home.address' })}</span>
              <Input
                placeholder={formatMessage({ id: 'home.input_other_address' })}
                style={{ width: 380 }}
                onChange={e => this.setState({ to: e.target.value })}
              />
              <span style={{ color: '#f5222d' }}>*</span>
            </div>
            <div style={{ display: 'flex', margin: 20 }}>
              <span style={{ width: 80 }}>{formatMessage({ id: 'home.transfer_amount' })}</span>
              <Input
                placeholder={formatMessage({ id: 'home.input_transfer_fax_amount' })}
                style={{ width: 380 }}
                addonAfter="App"
                onChange={e => this.setState({ fax: e.target.value })}
              />
              <span style={{ color: '#f5222d' }}>*</span>
            </div>
          </Modal>

          <Modal
            visible={!!mType}
            mask={false}
            destroyOnClose
            title={
              <div
                style={{
                  width: '100%',
                  cursor: 'move',
                  color: callTitleColor,
                }}
                onMouseOver={() => {
                  if (this.state.disabled) {
                    this.setState({
                      disabled: false,
                    });
                  }
                }}
                onMouseOut={() => {
                  this.setState({
                    disabled: true,
                  });
                }}
              >
                {chatUser && (chatUser.ensName || chatUser.nickName)} [{status}]
              </div>
            }
            closable={false}
            maskClosable={false}
            footer={null}
            bodyStyle={{ padding: 0 }}
            width={800}
            modalRender={modal => (
              <ReactDraggable disabled={this.state.disabled}>{modal}</ReactDraggable>
            )}
          >
            <div
              style={{
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'black',
                position: 'relative',
              }}
            >
              <video ref={this.videoRef} style={{ width: '100%' }} autoPlay></video>
              <video
                style={{ height: 128, position: 'absolute', left: 0, bottom: 0 }}
                ref={this.localVideoRef}
                autoPlay
                muted
              ></video>
              <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
                {status === MediaStatus.ring ? (
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<PhoneOutlined />}
                    onClick={this.acceptInvite}
                    style={{ marginRight: 16 }}
                  />
                ) : null}
                {status == MediaStatus.active ? (
                  <Button
                    type="primary"
                    size="large"
                    shape="circle"
                    icon={audioEnable ? <AudioOutlined /> : <AudioMutedOutlined />}
                    onClick={this.toggleAudio}
                    style={{ marginRight: 16 }}
                  />
                ) : null}
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  size="large"
                  icon={<PhoneOutlined style={{ transform: 'rotateZ(-135deg)' }} />}
                  onClick={this.endMedia}
                />
              </div>
            </div>
          </Modal>
          <Modal
            visible={!!groupType}
            mask={false}
            destroyOnClose
            title={
              <div
                style={{
                  width: '100%',
                  cursor: 'move',
                }}
                onMouseOver={() => {
                  if (this.state.disabled) {
                    this.setState({
                      disabled: false,
                    });
                  }
                }}
                onMouseOut={() => {
                  this.setState({
                    disabled: true,
                  });
                }}
              >
                Group call
              </div>
            }
            closable={false}
            maskClosable={false}
            footer={null}
            bodyStyle={{ padding: 0 }}
            width={1000}
            modalRender={modal => (
              <ReactDraggable disabled={this.state.disabled}>{modal}</ReactDraggable>
            )}
          >
            <div
              ref={this.groupVideoContainerRef}
              style={{
                width: '100%',
                minHeight: 500,
                backgroundColor: 'black',
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ width: '33%', position: 'relative', display: 'flex' }}>
                <p
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    color: '#fff',
                    fontSize: 18,
                  }}
                >
                  ME
                </p>
                <video
                  style={{ width: '100%' }}
                  ref={this.localGroupVideoRef}
                  autoPlay
                  muted
                ></video>
              </div>
              <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10000 }}>
                <Button
                  type="primary"
                  size="large"
                  shape="circle"
                  icon={audioEnable ? <AudioOutlined /> : <AudioMutedOutlined />}
                  onClick={this.toggleAudio}
                  style={{ marginRight: 16 }}
                />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  size="large"
                  icon={<PhoneOutlined style={{ transform: 'rotateZ(-135deg)' }} />}
                  onClick={this.endGroupMedia}
                />
              </div>
            </div>
          </Modal>
        </div>
        <Modal
          title="Claim or Get an ENS Name"
          visible={this.state.nameModal}
          cancelText="Cancel"
          okText="Ok"
          onCancel={() => this.setState({ nameModal: false })}
          onOk={this.modifyEnsName}
          okButtonProps={{ loading: this.state.confirmLoading }}
        >
          <div style={{marginBottom: 16}}>Claim your ENS name or get a subddomain name of .beagles.eth </div>
          <Input
            placeholder='.eth or .beagles.eth'
            value={this.state.nameValue}
            onChange={e => this.setState({ nameValue: e.target.value })}
          ></Input>
        </Modal>
      </NeedLogin>
    );
  }
}

const mapStateToProps = state => {
  return {
    contract: state.contract,
    user: state.user,
    account: state.account,
    media: state.media,
    loading: state.loading,
    meetingroom: state.meetingroom,
    currentRoom: state.meetingroom.currentRoom,
    meetingServer:state.meetingroom.meetingServer,
    roomUser: state.meetingroom.user,
    listeners: state.meetingroom.listeners,
    audioEnable: state.meetingroom.audioEnable,
    onlineSpeakers: state.meetingroom.onlineSpeakers,
  };
};

export default connect(mapStateToProps)(HomePage);
