import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Icon, Input, Modal } from 'antd';
import { message as ant_message } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { PictureOutlined, PhoneOutlined, VideoCameraOutlined, EditOutlined } from '@ant-design/icons';
import MessageRow from './MessageRow';
import GroupMessagRow from './GroupMessageRow';

import { formatTime } from '@/app/util';
class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMessage: '',
      previewVisible: false,
      previewURL: '',
      nameModal: false,
      mNickName: '',
      mAddress: '',
    }
  }

  sendMessage = () => {
    const { currentMessage } = this.state;
    const { shhPubKey, address, isGroup } = this.props.chatTo;
    const { visitorMode } = this.props.account;
    if (visitorMode) {
      ant_message.warning(formatMessage({ id: 'chat.visitor_forbidden_message' }));
      return;
    }
    if (!currentMessage) {
      alert(formatMessage({ id: 'chat.message_not_null' }))
    } else {
      if (isGroup) {
        this.props.dispatch({ type: 'user/sendGroupMessage', payload: { currentMessage } })
      } else {
        this.props.dispatch({ type: 'user/sendShhMessage', payload: { to: address, shhPubKey, currentMessage } })
      }
      this.textarea.value = '';
      this.setState({ currentMessage: '' })
    }
  }

  openImagePreview = (previewURL) => {
    this.setState({ previewVisible: true, previewURL })
  }

  openImageChoose = () => {
    this.imageInput.click()
  }

  onKeyDown = (e) => {
    if (e.ctrlKey && e.keyCode === 13) {
      const { currentMessage } = this.state;
      this.textarea.value = currentMessage + '\n'
      this.setState({ currentMessage: currentMessage + '\n' })
    } else if (e.keyCode === 13) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  // readFileContent = (file) => {
  //   const reader = new FileReader();
  //   return new Promise((resolve, reject) => {
  //     reader.onload = event => resolve(event.target.result);
  //     reader.onerror = error => reject(error);
  //     reader.readAsDataURL(file)
  //   })
  // }

  // sendImage = (e) => {
  //   const imageFile = e.target.files[0];
  //   const { shhPubKey, address } = this.props.chatTo;

  //   this.readFileContent(imageFile).then(content => {
  //     this.props.dispatch({ type: 'user/sendImage', payload: { to: address, shhPubKey, image: content } })
  //   }).catch((err) => {
  //     console.log(`read file error`)
  //     console.log(err)
  //   })

  // }

  sendImage = (e) => {
    const imageFile = e.target.files[0];
    const { shhPubKey, address, isGroup } = this.props.chatTo;

    var formData = new FormData();
    formData.append('image', imageFile);

    const { visitorMode } = this.props.account;
    if (visitorMode) {
      ant_message.warning(formatMessage({ id: 'chat.visitor_forbidden_message' }));
      return;
    }
    if (imageFile && imageFile.name) {
      this.props.dispatch({ type: 'user/saveImageToSwarmCreateDirectory', payload: { group: isGroup ? true : false, to: address, shhPubKey, fileName: imageFile.name, formData } })
    } else {
      console.log(`imagefile name is null ${imageFile}`)
    }

    this.imageInput.value = '';
  }

  scrollToBottom = () => {
    const chat = document.getElementById('chat');
    if (chat) {
      chat.scrollTo(0, document.querySelector('#chat').scrollHeight)
    }
  }

  modifyNickName = (mAddress, mNickName) => {
    this.setState({ mNickName, mAddress, nameModal: true });
  };

  confirmModifyName = () => {
    const { mAddress, mNickName } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'user/changeFriendName', payload: { friendAddress: mAddress, nickName: mNickName } });
    this.setState({ mNickName: '', mAddress: '', nameModal: false });
  };

  render() {
    const { previewVisible, previewURL, nameModal, mNickName } = this.state;
    const { ensName, nickName, address, time, isGroup } = this.props.chatTo;
    const { loginAddress } = this.props.account;
    const { bzzURL } = this.props.init;
    const { message, pendingMessage } = this.props.user;
    const messageLabled = message.map(i => { return { ...i, status: 'complete' } });
    const pendingMessageLabled = pendingMessage.map(i => { return { ...i, status: 'pending' } })
    const messageList = messageLabled.concat(pendingMessageLabled).sort((i, j) => i.time - j.time);

    const currentUserChat = messageList.filter(i => (!i.group) && (i.from === address || i.to === address))
    const groupChatList = messageList.filter(i => i.group);
    setTimeout(this.scrollToBottom, 100);
    return (
      this.props.chatTo
        ? <div>
          {isGroup
            ? <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <h3 style={{ marginBottom: 0 }}>{formatMessage({ id: 'chat.public_room' })}</h3>
            </div>
            : <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <h3 style={{ marginBottom: 0 }}>{nickName || ensName || formatMessage({ id: 'chat.no_nick_name' })}{<EditOutlined style={{ marginLeft: 8 }} onClick={() => this.modifyNickName(address, nickName)} />}</h3>
              <p>({address})</p>
            </div>}

          <div id='chat' style={{ overflowY: 'auto', height: 'calc(100vh - 20px - 70px - 30px - 150px)', minHeight: 50, backgroundColor: 'rgb(238, 238, 238)', padding: 20 }}>
            {!isGroup
              ? <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', width: 180, backgroundColor: '#fff', borderRadius: 10 }}>{formatTime(time)}{formatMessage({ id: 'chat.join_chat' })}</div>
              </div>
              : null}
            {isGroup
              ? groupChatList.map((m, i) => <GroupMessagRow key={i} openImagePreview={this.openImagePreview} bzzURL={bzzURL} message={m} currentAccount={loginAddress} />)
              : currentUserChat.map((m, i) => <MessageRow key={i} openImagePreview={this.openImagePreview} bzzURL={bzzURL} message={m} currentAccount={loginAddress} displayAvatar={ensName && ensName[0] || nickName && nickName[0] || '0x'} />)
            }
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              height: 30,
              borderTop: '1px solid rgb(221,221,221)',
              backgroundColor: 'rgb(238, 238, 238)',
              width: '100%',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <input type='file' name='image' style={{ display: 'none' }} accept="image/*" ref={e => this.imageInput = e} onChange={this.sendImage} />
              <PictureOutlined style={{ fontSize: 17 }} onClick={this.openImageChoose} />
              <div>
                <PhoneOutlined style={{ cursor: 'pointer', fontSize: 17, marginRight: 8 }} onClick={this.props.startAudio} />
                <VideoCameraOutlined style={{ cursor: 'pointer', fontSize: 17 }} onClick={this.props.startVideo} />
              </div>
            </div>
            <textarea
              ref={e => this.textarea = e}
              onChange={(e) => this.setState({ currentMessage: e.target.value })}
              onKeyDown={this.onKeyDown}
              style={{
                // borderTop: '1px solid rgb(221,221,221)',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                backgroundColor: 'rgb(238, 238, 238)',
                display: 'block',
                height: 150,
                width: '100%',
                padding: 8,
                overflow: 'auto',
                fontSize: 15,
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
                fontFamily: 'Arial,PingFangSC-Regular,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,sans-serif',
              }} />
            <Button
              onClick={this.sendMessage}
              style={{
                position: 'absolute',
                bottom: 10,
                right: 20,
                backgroundColor: 'rgba(9, 146, 8, 0.6)',
                color: '#fff'
              }}>
              {formatMessage({ id: 'chat.send_message' })}
            </Button >
          </div>

          <Modal visible={previewVisible} footer={null} onCancel={() => this.setState({ previewVisible: false, previewURL: '' })}>
            <img alt="example" style={{ width: '100%' }} src={previewURL} />
          </Modal>
          <Modal
            visible={nameModal}
            title="modify nick name"
            onCancel={() => this.setState({ mNickName: '', mAddress: '', nameModal: false })}
            onOk={this.confirmModifyName}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Input onChange={e => this.setState({ mNickName: e.target.value })} defaultValue={mNickName} value={mNickName} />
          </Modal>
        </div>
        : null
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    account: state.account,
    init: state.init,
  }
}

export default connect(mapStateToProps)(ChatBox);
