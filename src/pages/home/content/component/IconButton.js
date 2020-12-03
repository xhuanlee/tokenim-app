import React, { Component } from 'react';
import { QuestionCircleOutlined, SwapOutlined, InteractionOutlined, AuditOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import styles from './style.css';

class IconButton extends Component {
  render() {
    const {
      current = '',
      okey = '',
      action = () => { },
      icon = <QuestionCircleOutlined style={{ fontSize: '30px' }} />,
      text = '',
    } = this.props;

    return (
      <div
        onClick={() => action(okey)}
        style={{
          color: current === okey ? 'rgb(24,144,255)' : '',
          border: current === okey ? '1px solid rgba(24,144,255,0.5)' : '1px solid #e8e8e8'
        }}
        className={styles.IconButton}>
        {icon}
        <p style={{ marginBottom: 0 }}>{text}</p>
      </div>
    );
  }
}

export default IconButton;
