import React, { Component } from 'react';
import { connect } from 'dva';
import { Avatar, Tooltip, Button, Popover, Spin, Modal } from 'antd';
import { LogoutOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { shortenAddress, copyToClipboard } from '../../../app/util'

const confirm = Modal.confirm;

class MyAccountInfo extends Component {
  refreshBalance = () => {
    this.props.dispatch({ type: 'user/getBalance' });
  }

  getRegisterReward = () => {
    this.props.dispatch({ type: 'user/getRegisterReward' });
  }

  getLoginReward = () => {
    this.props.dispatch({ type: 'user/getLoginReward' });
  }

  showConfirm = () => {
    confirm({
      title: '是否登出',
      content: '请点击确定，登出账号',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.props.dispatch({ type: 'account/logout' });
      },
      onCancel: () => { },
    });
  }

  render() {
    const { loginAddress, loginEns, visitorMode } = this.props.account;
    const { balanceLoading, registerReward, loginReward, faxBalance, registerRewardLoading, loginRewardLoading } = this.props.user;
    const short_address = shortenAddress(loginAddress, 12);
    const display_username = visitorMode ? '游客' : (loginEns || '我的账户')
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 66 }}>
          <Avatar size={50} style={{ backgroundColor: '#00a2ae' }}>我</Avatar>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: 65, width: 135 }}>
          <div style={{ display: 'flex', margin: '5px 0 0', fontSize: 13, alignItems: 'center' }}>
            <p style={{ width: 60, margin: 0 }}>{display_username}</p>
            <Tooltip title='登出账号'>
              <LogoutOutlined onClick={this.showConfirm} />
            </Tooltip>
          </div>
          <Spin spinning={balanceLoading}>
            <div>
              <div style={{ display: 'flex' }}>
                <Tooltip title={loginAddress}>
                  <div style={{ fontWeight: 500, width: 110, height: 20 }}>
                    <span>{short_address || '游客模式'}</span>
                  </div>
                </Tooltip>
                <Tooltip title="拷贝地址">
                  <CopyOutlined onClick={() => copyToClipboard(loginAddress)} style={{ fontWeight: 500, marginLeft: 0 }} />
                </Tooltip>
              </div>
              <div style={{ display: 'flex', fontWeight: 500 }}>
                <div style={{ margin: 0, fontSize: 13, width: 110 }}>
                  FAX: {faxBalance}
                </div>
                <Popover
                  title="领取代币"
                  content={<div>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                      <div style={{ width: 120 }}>
                        登陆奖励 5 FAX:
                  </div>
                      <Button
                        size="small"
                        type="primary"
                        disabled={loginReward}
                        loading={loginRewardLoading}
                        onClick={this.getLoginReward}
                      >
                        {loginReward ? '已领取' : '领取'}
                      </Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 120 }}>
                        注册奖励20 FAX:
                  </div>
                      <Button
                        size="small"
                        type="primary"
                        disabled={registerReward}
                        loading={registerRewardLoading}
                        onClick={this.getRegisterReward}
                      >
                        {registerReward ? '已领取' : '领取'}
                      </Button>
                    </div>
                  </div>}
                >
                  <InfoCircleOutlined style={{ fontWeight: 500 }} />
                </Popover>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
    user: state.user,
  }
}

export default connect(mapStateToProps)(MyAccountInfo);
