import React from 'react';
import { Avatar, Divider, Popover, Badge } from 'antd';
import { TwitterOutlined, FacebookOutlined, WechatOutlined } from '@ant-design/icons';
import style from './ClubhouseUserItem.less';
import { DEFAULT_AVATAR } from '@/app/constant';

const ClubhouseUserItem = (props) => {
  const { user, online } = props;
  const { id, nickname, avatar, introduce, twitter, facebook, wechat } = user;

  const popContent = (
    <div className={style.userPopover}>
      <div><a target="_blank" rel="noreferrer noopener" href={twitter && twitter !== '' ? twitter : ''}><TwitterOutlined /> {twitter}</a></div>
      <div><a target="_blank" rel="noreferrer noopener" href={facebook && facebook !== '' ? facebook : ''}><FacebookOutlined /> {facebook}</a></div>
      <div><a><WechatOutlined /> {wechat}</a></div>
      <Divider />
      <p>{introduce}</p>
    </div>
  );

  return (
    <Popover title={nickname} content={popContent} trigger="click">
      <div className={style.userItemContainer}>
        <Avatar alt={nickname} shape="square" size={64} src={avatar && avatar !== '' ? avatar : DEFAULT_AVATAR} />
        <div className={style.nickname}><Badge status={ online ? 'success' : 'error' } text={nickname} /></div>
      </div>
    </Popover>
  );
}

export default ClubhouseUserItem;
