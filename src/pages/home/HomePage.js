import React, { Component, createRef } from 'react';
import { connect } from 'dva';
import { Layout, Avatar, List, Modal, Input, Alert, Tooltip, Button, message } from 'antd';
import ReactDraggable from 'react-draggable';
import { formatMessage } from 'umi-plugin-locale';
import { LoadingOutlined, CloseCircleOutlined, CheckCircleOutlined, HomeOutlined, UserOutlined,
  UserAddOutlined, InteractionOutlined, TeamOutlined, PhoneOutlined } from '@ant-design/icons';
import MyAccountRow from './sider/MyAccountInfo'
import ChatBox from './content/chatbox/ChatBox'
import HomeTab from './HomeTab'
import { shortenAddress, formatTime } from '@/app/util'
import { MediaStatus, MediaType } from '@/models/media';
import IMApp from '@/app/index';
import {
  createSessionDescription, getSDPOptions, getUserMediaOptions, sendAccept,
  sendAnswer, sendCandidate,
  sendHangup,
  sendInvite, sendInviteReply,
  sendOffer,
  sendReject,
  SignalType, WebrtcConfig,
} from '@/app/webrtc';
import NeedLogin from '@/pages/home/NeedLogin';
import { saveShhName } from '@/app/metamask';

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
    };
    this.canAddCandidate = false;
    this.passive = false;
    this.peer = null;
    this.localStream = null;
    this.cacheCandidates = [];
  }

  componentDidMount() {
    // 清除首页样式
    // document.getElementById('container').style = '';
    // document.getElementById('root').style = '';
    if (document.getElementById('AiCoin')) {
      document.getElementById('AiCoin').style.display = 'none'
    }

    this.props.dispatch({ type: 'account/saveEnsName' })
    this.props.dispatch({ type: 'user/getUserInfo' })
    this.props.dispatch({ type: 'contract/getContractInfo' })
    this.props.dispatch({ type: 'user/readChatHistory' })

    IMApp.setSiganlCallback(this.onSignalMessage);
  }

  componentWillUnmount() {
    // document.getElementById('container').style = 'padding-top: 85px; display: flex; flex-wrap: wrap; justify-content: center; justify-items: center';
    // document.getElementById('root').style = 'width:540px; padding-bottom: 100px';
    // if (document.getElementById('AiCoin')) {
    //   document.getElementById('AiCoin').style.display = 'block'
    // }
  }

  setChatToUser = (user) => {
    const { dispatch } = this.props;
    dispatch({ type: 'media/saveChatUser', payload: { chatUser: user } });
  }

  openNewMessageModal = () => {
    this.setState({ newDialogModal: true })
  }
  openNewTransferModal = () => {
    this.setState({ newTranferModal: true })
  }

  confirmTransFax = () => {
    const { to, fax } = this.state;
    this.props.dispatch({ type: 'user/transFax', payload: { to, fax } })
  }

  createDialog = () => {
    const { addFromEns } = this.state;
    if (addFromEns) {
      this.createDialogByEns();
    } else {
      this.createDialogByAddress();
    }
  }

  createDialogByEns = () => {
    const { ensName } = this.state;
    const { queryENSAddress, queryShhPubKey } = this.props.account;
    const time = (new Date()).getTime();
    if (queryENSAddress && queryShhPubKey) {
      this.props.dispatch({ type: 'user/addFriend', payload: { ensName, friendAddress: queryENSAddress, shhPubKey: queryShhPubKey, time } })
      this.setState({ newDialogModal: false });
      this.setChatToUser({ ensName, address: queryENSAddress, shhPubKey: queryShhPubKey, time })
    } else {
      alert(formatMessage({ id: 'home.shh_format_error' }));
    }
  }

  createDialogByAddress = () => {
    const { nickName } = this.state;
    const { queryAddress, queryShhPubKeyByAddress } = this.props.account;
    const time = (new Date()).getTime();
    if (queryAddress && queryShhPubKeyByAddress) {
      this.props.dispatch({ type: 'user/addFriend', payload: { nickName, friendAddress: queryAddress, shhPubKey: queryShhPubKeyByAddress, time } })
      this.setState({ newDialogModal: false });
      this.setChatToUser({ address: queryAddress, nickName, shhPubKey: queryShhPubKeyByAddress, time })
    } else {
      alert(formatMessage({ id: 'home.shh_format_error' }));
    }
  }

  cancelDialogModal = () => {
    this.setState({ newDialogModal: false })
  }
  cancelTransferModal = () => {
    this.setState({ newTranferModal: false })
  }

  openHomeTab = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'media/saveChatUser', payload: { chatUser: null } });
  }

  onENSNameChange = (e) => {
    const queryENSName = e.target.value;
    if (queryENSName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(queryENSName)) {
      this.setState({ ensName: queryENSName, nameError: '' })
      this.props.dispatch({ type: 'account/getEnsUserData', payload: queryENSName })
    } else {
      this.setState({ nameError: formatMessage({ id: 'home.ens_name_format_error' }), ensName: queryENSName })
    }
  }

  onWhisperChange = (e) => {
    const publicKey = e.target.value;
    this.props.dispatch({ type: 'account/saveAccountState', payload: { queryShhPubKey: publicKey, queryShhPubKeyByAddress: publicKey } });
  }

  onAddressChange = (e) => {
    const address = e.target.value;
    this.setState({ chatAddress: address })
    if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
      this.props.dispatch({ type: 'account/getAddressUserData', payload: address })
    }
  }

  clearMedia = () => {
    console.log('clearMedia');
    try {
      if (this.peer) {
        this.peer.close();
        this.peer = null;
      }
    } catch (e) {
    }
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }
    } catch (e) {
    }

    clearInterval(this.checkCallInterval);
  }

  getMediaError = (e) => {
    console.log('getMediaError: ', e);
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.error } });
    message.error('get media error, please try again', 10);
  }

  // webrtc:3
  gotLocalStream = async (stream) => {
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
    const { chatUser: { shhPubKey }, type } = media;
    try {
      // webrtc:4
      const offerSdp = await this.peer.createOffer(getSDPOptions(type));
      await this.peer.setLocalDescription(offerSdp);
      sendOffer(loginEns, myShhPubKey, address, shhPubKey, offerSdp.sdp);
    } catch (e) {
    }
  }

  // webrtc:2
  getLocalMedia = () => {
    console.log('getLocalMedia');
    const { media: { type } } = this.props;
    navigator.mediaDevices
      .getUserMedia(getUserMediaOptions(type))
      .then(this.gotLocalStream)
      .catch(this.getMediaError);
  }

  // webrtc:6
  onIceCandidate = (e) => {
    console.log('onIceCandidate');
    if (!e.candidate) {
      return;
    }
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey } } = media;

    sendCandidate(loginEns, myShhPubKey, address, shhPubKey, JSON.stringify(e.candidate));
  }

  onIceCandidateStateChange = (e) => {
    console.log('onIceCandidateStateChange: ', e);
    if (this.peer.iceConnectionState === "failed") {
      this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.error } });
      message.error('connect error, please try again', 10);
    } else if (this.peer?.iceConnectionState === 'connected') {
      this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.active } });
    }
  }

  // webrtc:7
  gotRemoteStream = (e) => {
    console.log('gotRemoteStream');
    if (this.videoRef.current.srcObject !== e.streams[0]) {
      this.videoRef.current.srcObject = e.streams[0];
      console.log('set remote stream success');
    }
  }

  // webrtc:1
  createPeer = () => {
    console.log('createPeer start');
    this.peer = new RTCPeerConnection(WebrtcConfig);
    this.peer.onicecandidate = this.onIceCandidate;
    this.peer.ontrack = this.gotRemoteStream;
    this.peer.oniceconnectionstatechange  = this.onIceCandidateStateChange;
    console.log('createPeer end');
  }

  loadCacheCandidate = async () => {
    console.log('loadCacheCandidate');
    if (this.cacheCandidates && this.cacheCandidates.length > 0) {
      for (let i = 0; i < this.cacheCandidates.length; i++) {
        console.log('add cache candidate: ' + i);
        await this.peer.addIceCandidate(this.cacheCandidates[i]);
      }
      this.cacheCandidates = [];
    }
  }

  onReceiveInvite = (type) => {
    console.log('onReceiveInvite');
    this.passive = true;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.ring } });
    this.props.dispatch({ type: 'media/saveType', payload: { type } });

    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey } } = media;
    sendInviteReply(loginEns, myShhPubKey, address, shhPubKey);
  }

  onReceiveInviteReply = () => {
    console.log('onReceiveInviteReply');
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.wait } });
  }

  onReceiveAccept = async () => {
    console.log('onReceiveAccept');
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.connect } });
    await this.createPeer();
    this.getLocalMedia();
  }

  onReceiveReject = () => {
    console.log('onReceiveReject');
    this.canAddCandidate = false;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
    this.props.dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });
  }

  onReceiveHangup = () => {
    console.log('onReceiveHangup');
    this.passive = false;
    this.canAddCandidate = false;
    this.props.dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
    this.props.dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });

    this.clearMedia();
  }

  onReceiveOffer = async (sdp) => {
    console.log('onReceiveOffer');
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey }, type } = media;
    try {
      await this.peer.setRemoteDescription(createSessionDescription('offer', sdp));
      this.canAddCandidate = true;
      await this.loadCacheCandidate();
      const answerSdp = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answerSdp);
      sendAnswer(loginEns, myShhPubKey, address, shhPubKey, answerSdp.sdp);
    } catch (e) {
    }
  }

  // webrtc:5
  onReceiveAnswer = async (sdp) => {
    console.log('onReceiveAnswer');
    try {
      await this.peer.setRemoteDescription(createSessionDescription('answer', sdp));
      this.canAddCandidate = true;
      await this.loadCacheCandidate();
    } catch (e) {
    }
  }

  onReceiveCandidate = async (c) => {
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
  }

  onReceiveCandidateRemoval = (c) => {
    console.log('onReceiveCandidateRemoval');
  }

  onSignalMessage = (msg) => {
    console.log('receive signal message: ', msg);
    const { name, from, shh, signal, content } = msg;
    this.props.dispatch({ type: 'user/addFriend', payload: { friendAddress: from, ensName: name, shhPubKey: shh, chat: true } });

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
  }

  checkCallStatus = () => {
    console.log('checkCallStatus');
    const { media } = this.props;
    const { status, chatUser } = media;
    if (status === MediaStatus.invite) {
      const msg = formatMessage({ id: 'offline_notice' });
      message.warn(`${chatUser.ensName || chatUser.nickName} ${msg}`);
      return ;
    }

    clearInterval(this.checkCallInterval);
  }

  startCall = (type) => {
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey } } = media;
    sendInvite(loginEns, myShhPubKey, address, shhPubKey, type);

    dispatch({ type: 'media/saveType', payload: { type } });
    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.invite } });

    this.checkCallInterval = setInterval(this.checkCallStatus, 5000);
  }

  acceptInvite = async () => {
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey } } = media;
    sendAccept(loginEns, myShhPubKey, address, shhPubKey);

    await this.createPeer();
    this.getLocalMedia();

    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.connect } });
  }

  endMedia = () => {
    this.passive = false;
    this.canAddCandidate = false;
    const { dispatch } = this.props;
    const { account, media } = this.props;
    const { address, loginEns, shhPubKey: myShhPubKey } = account;
    const { chatUser: { shhPubKey }, status } = media;
    if (status === MediaStatus.ring) {
      sendReject(loginEns, myShhPubKey, address, shhPubKey);
    } else {
      sendHangup(loginEns, myShhPubKey, address, shhPubKey);
    }

    this.clearMedia();
    dispatch({ type: 'media/saveType', payload: { type: MediaType.none } });
    dispatch({ type: 'media/saveStatus', payload: { status: MediaStatus.init } });
  }

  modifyEnsName = () => {
    const { nameValue } = this.state;
    if (!nameValue || nameValue.trim().length === 0) {
      message.warn('name can not be null');
      return;
    }

    this.setState({ confirmLoading: true });
    saveShhName(nameValue).then(() => {
      this.setState({ nameModal: false, confirmLoading: false });
    }).catch(e => {
      console.error("save shh name error: ", e);
    });
  }

  render() {
    this.videoRef = createRef();
    this.localVideoRef = createRef();
    const { media } = this.props;
    const { type: mType, chatUser, status } = media;
    const { newDialogModal, newTranferModal, addFromEns, ensName, nameError, chatAddress, nickName } = this.state;
    const { faxBalance, etherBalance, friends } = this.props.user;
    const { queryENSAvaiable, queryENSLoading, queryENSAddress, queryShhPubKey, queryShhPubKeyByAddress } = this.props.account;
    const { loginAddress } = this.props.account;

    let callTitleColor = undefined;
    if (status === MediaStatus.active) {
      callTitleColor = '#389e0d';
    }
    if (status === MediaStatus.error) {
      callTitleColor = '#f5222d';
    }

    const errorMessage = addFromEns && ensName ? nameError ? nameError : (queryENSAvaiable || !ensName) ? formatMessage({ id: 'home.ens_name_not_register_error' }) : '' : '';
    const queryENSAddressTip = queryENSAddress || (queryENSAvaiable ? formatMessage({ id: 'home.ens_name_not_register' }) : '');

    const ensNameCheck = ensName
      ? queryENSLoading
        ? <Tooltip title={formatMessage({ id: 'home.searching' })}>
          <LoadingOutlined style={{ color: '#1890ff' }} />
        </Tooltip>
        : queryENSAvaiable
          ? <Tooltip title={formatMessage({ id: 'home.ens_name_not_register' })}>
            <CloseCircleOutlined style={{ color: '#f5222d' }} />
          </Tooltip>
          : <Tooltip title={formatMessage({ id: 'home.registered' })}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
      : null;

    return (
      <NeedLogin>
        <div style={{ height: '100vh', backgroundColor: 'rgb(213,216,225)' }}>
          <Layout style={{ height: '100vh', width: 1000, margin: 'auto', backgroundColor: 'rgb(213,216,225)' }}>
            <Sider width={200} style={{
              margin: '10px 0px',
              backgroundColor: '#ffffff',
              overflowX: 'hidden',
              overflowY: 'auto',
            }}>
              <MyAccountRow onClick={() => this.setState({ nameModal: true })} />

              <div style={{
                margin: '5px 0px',
                display: 'flex',
                flexDirection: 'row',
                borderBottom: '1px solid #e8e8e8',
                borderTop: '1px solid #e8e8e8',
                height: 50,
                alignItems: 'center',
                backgroundColor: 'rgba(40,40,40, 0.7)',
                color: '#fff',
              }}>
                <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #e8e8e8' }}>
                  <HomeOutlined style={{ fontSize: 22, }} onClick={this.openHomeTab} />
                  {/* <p>个人信息页</p> */}
                </div>
                <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #e8e8e8' }}>
                  <UserAddOutlined style={{ fontSize: 22 }} onClick={this.openNewMessageModal} />
                  {/* <p>新建对话</p> */}
                </div>
                <div style={{ flex: 1, textAlign: 'center', }}>
                  <InteractionOutlined style={{ fontSize: 22 }} onClick={this.openNewTransferModal} />
                  {/* <p>发起转账</p> */}
                </div>
              </div>

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
                }}>
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
                      backgroundColor: chatUser && chatUser.address === friend.address ? '#e6f7ff' : '',
                    }}>
                    <List.Item.Meta
                      avatar={<Avatar>{friend.ensName && friend.ensName[0] || friend.nickName && friend.nickName[0] || '0x'}</Avatar>}
                      title={friend.nickName || friend.ensName || shortenAddress(friend.address, 10)}
                      description={formatTime(friend.time)}
                    />
                  </List.Item>
                )}
              />
            </Sider>
            <Layout style={{ overflowY: 'hidden', height: '100vh', backgroundColor: 'rgb(213,216,225)' }}>
              <Content style={{ background: '#fff', margin: '10px 3px', overflowY: 'auto' }}>
                {chatUser
                  ? <ChatBox chatTo={chatUser} startAudio={() => this.startCall(MediaType.audio)} startVideo={() => this.startCall(MediaType.video)} />
                  : <HomeTab address={loginAddress} token={faxBalance} ether={etherBalance} />
                }
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
              <div style={{ flex: 1, justifyContent: 'center', display: 'flex', cursor: 'pointer' }} onClick={() => this.setState({ addFromEns: true })}>
                <div style={{ textAlign: 'center', width: 90, color: addFromEns ? 'rgb(24, 144, 255)' : '', borderBottom: addFromEns ? '1px solid rgba(24, 144, 255, 0.5)' : '0px' }}>
                  {formatMessage({ id: 'home.ens_username' })}
                </div>
              </div>
              <div style={{ flex: 1, justifyContent: 'center', display: 'flex', cursor: 'pointer' }} onClick={() => this.setState({ addFromEns: false })} >
                <div style={{ textAlign: 'center', width: 90, color: !addFromEns ? 'rgb(24, 144, 255)' : '', borderBottom: !addFromEns ? '1px solid rgba(24, 144, 255, 0.5)' : '0px' }}>
                  {formatMessage({ id: 'home.wallet_address' })}
                </div>
              </div>
            </div>

            {addFromEns
              ? <div>
                <div style={{ display: 'flex', margin: '20px 20px 5px 20px' }}>
                  <Input
                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder={formatMessage({ id: 'home.input_other_ens_name' })}
                    addonAfter=".fax"
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
                {errorMessage
                  ? <div style={{ margin: '5px 20' }}>
                    <Alert message={errorMessage} type="error" />
                  </div>
                  : <div style={{ margin: '5px 20px' }}>
                    <Alert message={<div>
                      <div>{formatMessage({ id: 'home.alert_address' })}<br />{queryENSAddressTip}</div>
                      <hr style={{ borderBottom: '1px solid #91d5ff', borderTop: '0px' }} />
                      <div>{formatMessage({ id: 'home.alert_shh_pubkey' })} <br />{queryShhPubKey}</div>
                    </div>
                    } type="info" />
                  </div>}
              </div>
              : <div>
                <div style={{ display: 'flex', margin: 20 }}>
                  <span style={{ width: 80 }}>{formatMessage({ id: 'home.my_nickname' })}</span>
                  <Input
                    placeholder={formatMessage({ id: 'home.set_my_nickname' })}
                    style={{ width: 380 }}
                    onChange={(e) => this.setState({ nickName: e.target.value })}
                    defaultValue={nickName}
                  />
                </div>
                <div style={{ display: 'flex', margin: '20px 20px 5px' }}>
                  <span style={{ width: 80 }}>地址:<span style={{ color: '#f5222d' }}>*</span></span>
                  <Input
                    placeholder={formatMessage({ id: 'home.input_other_address' })}
                    style={{ width: 380 }}
                    onChange={this.onAddressChange}
                    defaultValue={chatAddress}
                  />
                </div>
                <div style={{ display: 'flex', margin: '20px 20px 5px' }}>
                  <span style={{ width: 80 }}>Whisper:<span style={{ color: '#f5222d' }}>*</span></span>
                  <Input.TextArea
                    placeholder="Please input whisper public key"
                    defaultValue={queryShhPubKeyByAddress}
                    width={380}
                    onChange={this.onWhisperChange}
                  />
                </div>

                <div style={{ margin: '20px 20px 20px' }}>
                  <Alert message={<div>
                    <div>{formatMessage({ id: 'home.alert_shh_pubkey' })} <br />{queryShhPubKeyByAddress}</div>
                  </div>
                  } type="info" />
                </div>
              </div>}
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
              <span>{faxBalance} FAX</span>
            </div>

            <div style={{ display: 'flex', margin: 20 }}>
              <span style={{ width: 80 }}>{formatMessage({ id: 'home.address' })}</span>
              <Input placeholder={formatMessage({ id: 'home.input_other_address' })} style={{ width: 380 }} onChange={(e) => this.setState({ to: e.target.value })} />
              <span style={{ color: '#f5222d' }}>*</span>
            </div>
            <div style={{ display: 'flex', margin: 20 }}>
              <span style={{ width: 80 }}>{formatMessage({ id: 'home.transfer_amount' })}</span>
              <Input placeholder={formatMessage({ id: 'home.input_transfer_fax_amount' })} style={{ width: 380 }} addonAfter="FAX" onChange={(e) => this.setState({ fax: e.target.value })} />
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
            modalRender={(modal) => <ReactDraggable disabled={this.state.disabled}>{modal}</ReactDraggable>}
          >
            <div style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'relative' }}>
              <video ref={this.videoRef} style={{ width: '100%' }} autoPlay></video>
              <video style={{ height: 128, position: 'absolute', left: 0, bottom: 0 }} ref={this.localVideoRef} autoPlay muted></video>
              <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
                {
                  status === MediaStatus.ring ?
                    <Button type="primary" shape="circle" size="large" icon={<PhoneOutlined />} onClick={this.acceptInvite} style={{ marginRight: 16 }} /> : null
                }
                <Button type="primary" danger shape="circle" size="large" icon={<PhoneOutlined style={{ transform: 'rotateZ(-135deg)' }} />} onClick={this.endMedia} />
              </div>
            </div>
          </Modal>
        </div>
        <Modal
          title="Modify Name"
          visible={this.state.nameModal}
          cancelText="Cancel"
          okText="Ok"
          onCancel={() => this.setState({ nameModal: false })}
          onOk={this.modifyEnsName}
          okButtonProps={{ loading: this.state.confirmLoading }}
        >
          <Input value={this.state.nameValue} onChange={(e) => this.setState({ nameValue: e.target.value })} />
        </Modal>
      </NeedLogin>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contract: state.contract,
    user: state.user,
    account: state.account,
    media: state.media,
    loading: state.loading,
  }
}

export default connect(mapStateToProps)(HomePage);
