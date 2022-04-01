import React, { useCallback } from 'react';
import { Avatar, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import router from 'umi/router';
import {ReactComponent as svgRoom} from '../../public/image/SVG/ROOM.svg';

const miniProgramList = [
  // { name: 'Defi', synopsis: 'Defi', link: '/home?s=defi', tooltip: 'dapps' },
  { name: '会议室', synopsis: '会议室', link: '/home?s=kademlia', tooltip: '会议室' },
  { name: 'Meeting Room', synopsis: 'Meeting Room', link: '/home?s=beagle', tooltip: 'Meeting Room' },
];

const MiniProgramItem = props => {
  const { name, synopsis, link, tooltip } = props;

  const navigate = useCallback(() => {
    router.push(link);
  }, [link]);

  return (
    <Tooltip title={tooltip} placement="right">
      <div
        onClick={navigate}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        {/*<Avatar src={'/image/SVG/ROOM.svg'} style={{width:24,height:24}}></Avatar>*/}
        <Avatar size={'large'} icon={<Icon component={svgRoom}></Icon>} style={{backgroundColor:'#D8D8D8;',background:'transparent'}}></Avatar>
        <span style={{ marginLeft: 8 }}>{synopsis}</span>
      </div>
    </Tooltip>
  );
};

const MiniProgramList = props => {
  return (
    <div>
      {miniProgramList.map(item => (
        <MiniProgramItem key={item.name} {...item} />
      ))}
    </div>
  );
};

export default MiniProgramList;
