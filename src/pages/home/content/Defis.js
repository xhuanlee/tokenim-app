import React from 'react';
import { Avatar, Tooltip } from 'antd';
import router from 'umi/router';
import DefiList from '@/app/defi-list';
import styles from './Defis.less'

const avatarColors = [ '#ff7a45', '#ffa940', '#ffa39e', '#faad14', '#d4b106', '#7cb305', '#08979c', '#1890ff', '#eb2f96' ];

const Dapp = (props) => {
  const { defi } = props;
  const { name, link, tooltip } = defi;

  return (
    <Tooltip title={tooltip}>
      <div
        onClick={() => router.push(link)}
        className={styles.defiItem}
      >
        <div>
          <Avatar size="large" style={{ backgroundColor: avatarColors[name.charCodeAt(0) % avatarColors.length] }}>{name.charAt(0)}</Avatar>
        </div>
        <p>{name}</p>
      </div>
    </Tooltip>
  );
};

const Defis = (props) => {
  return (
    <div style={{ display: 'flex', padding: 48, flexWrap: 'wrap' }}>
      {
        DefiList.map((d) => (<Dapp defi={d} />))
      }
    </div>
  );
}

export default Defis;
