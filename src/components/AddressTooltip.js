import React, { Component } from 'react';
import { Tooltip } from 'antd'

import { shortenAddress, copyToClipboard } from '../app/util'

class AddressTooltip extends Component {
  render() {
    const {
      address = '0x',
      length = 28
    } = this.props;

    return (
      <Tooltip title={address}>
        <div style={{ fontSize: 14, fontWeight: 400, color:'#8c8c8c' }} onClick={() => copyToClipboard(address)}>
          {shortenAddress(address, length)}
        </div>
      </Tooltip>
    );
  }
}

export default AddressTooltip;