import React, { Component } from 'react';
import { Avatar } from 'antd';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';

import { shortenAddress, stringToColour } from '@/app/util'

function formateTime(date) {
  const now = new Date();
  const time = new Date(date)
  if (now.getTime() - date <= 43200000) {
    return `${time.getHours()}:${time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()}`;
  } else {
    return `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()}`;
  }
}

class GroupMessageRow extends Component {

  goToChat = () => {
    const { message } = this.props;
    const { from, name } = message;
    window.App.jumpToChatUser(from, name);
  }

  render() {
    const { currentAccount, bzzURL, openImagePreview } = this.props;
    const { from, time, message, type, name } = this.props.message;
    const avatarLetter = name && name[0] || '0x'
    const displayName = name || shortenAddress(from, 18);
    const avatarColor = stringToColour(displayName)
    const sender = (currentAccount === from);
    return (
      sender ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div>
          {type && type === 'image'
            ? <img src={`${bzzURL}/bzz:/${message}`} alt="" style={{ marginBottom: 14, maxWidth: 200, maxHeight: 200, width: 'auto', height: 'auto', cursor: 'pointer' }} onClick={() => openImagePreview(`${bzzURL}/bzz:/${message}`)} />
            : <p style={{ border: '1px solid rgb(229, 229, 229)', borderRadius: 8, padding: '10px', backgroundColor: 'rgb(229, 243, 253)', maxWidth: 360, wordBreak: 'break-all' }}>{message}</p>}
          <p style={{ marginTop: -14, fontSize: 12, textAlign: 'right', paddingRight: 10 }}>{formateTime(time)}</p>
        </div>
        <div style={{ color: 'rgb(229, 243, 253)', marginLeft: -5 }}>
          <CaretRightOutlined />
        </div>
        <Avatar style={{ backgroundColor: '#00a2ae' }}>我</Avatar>
      </div>
        : <div>
          <div style={{ marginLeft: 46 }}>
            {displayName}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Avatar style={{ backgroundColor: avatarColor, cursor: 'pointer' }} onClick={this.goToChat}>{avatarLetter}</Avatar>
            <div style={{ color: '#fff', marginRight: -5 }}>
              <CaretLeftOutlined />
            </div>
            <div>
              {type && type === 'image'
                ? <img src={`${bzzURL}/bzz:/${message}`} alt="" style={{ marginBottom: 14, maxWidth: 200, maxHeight: 200, width: 'auto', height: 'auto', cursor: 'pointer' }} onClick={() => openImagePreview(`${bzzURL}/bzz:/${message}`)} />
                : <p style={{ border: '1px solid rgb(229, 229, 229)', borderRadius: 8, padding: '10px', backgroundColor: '#fff', maxWidth: 360, wordBreak: 'break-all' }}>{message}</p>}
              <p style={{ marginTop: -14, fontSize: 12, textAlign: 'right', paddingRight: 10 }}>{formateTime(time)}</p>
            </div>
          </div>
        </div>
    );
  }
}

export default GroupMessageRow;
