import React from 'react';
//import styles from './index.css';
import styles from './cyberconnect.css';

function BasicLayout(props) {
  return (
    <div className={styles.normal}>
      {props.children}
    </div>
  );
}

export default BasicLayout;
