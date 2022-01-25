import React from 'react';
import { Avatar, Divider, Popover, Badge, Button } from 'antd';
import { TwitterOutlined, FacebookOutlined, WechatOutlined, AudioOutlined,AudioMutedOutlined } from '@ant-design/icons';
import style from './ClubhouseUserItem.less';
import { DEFAULT_AVATAR } from '@/app/constant';

const ClubhouseUserItem = (props) => {
//  console.log(JSON.stringify(props));
  const { user, online } = props;
  const { stream,id, address, nickname, avatar, introduce, twitter, facebook, wechat,muted } = user;
  if (user)
    console.log(user.address+':'+user.id);
//  const {  nickname, avatar, introduce, twitter, facebook, wechat } = user;

  if (stream && stream.hasAudio())
  setTimeout(()=>{
        console.log('show :'+address);
        stream.show(address);
     },1000);
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
      <div className={style.userItemContainer} id={address}>
        <Avatar alt={nickname} shape="square" size={64} src={avatar && avatar !== '' ? avatar : DEFAULT_AVATAR} />
        <div className={style.nickname}>{muted?<AudioMutedOutlined style={{ fontSize: '18px',color:'red'}} />:null}<Badge status={ online ? 'success' : 'error' } text={nickname} /></div>

      </div>
    </Popover>
  );
}

export default ClubhouseUserItem;
