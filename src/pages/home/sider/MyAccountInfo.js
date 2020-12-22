import React, { Component } from 'react';
import { connect } from 'dva';
import { Avatar, Tooltip, Button, Popover, Spin, Modal } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { LogoutOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { shortenAddress, copyToClipboard } from '@/app/util'

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
      title: formatMessage({ id: 'account.logout_title' }),
      content: formatMessage({ id: 'account.logout_content' }),
      okText: formatMessage({ id: 'confirm' }),
      cancelText: formatMessage({ id: 'cancel' }),
      onOk: () => {
        this.props.dispatch({ type: 'account/logout' });
      },
      onCancel: () => { },
    });
  }

  render() {
    const { loginAddress, loginEns, visitorMode, isMetamask } = this.props.account;
    const { balanceLoading, registerReward, loginReward, faxBalance, registerRewardLoading, loginRewardLoading } = this.props.user;
    const short_address = shortenAddress(loginAddress, 12);
    const display_username = visitorMode ? formatMessage({ id: 'account.visitor' }) : (loginEns || formatMessage({ id: 'account.my_account' }))
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 66 }}>
          <Avatar size={50} style={{ backgroundColor: '#00a2ae' }}>{formatMessage({ id: 'account.me' })}</Avatar>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: 65, width: 135 }}>
          <div style={{ display: 'flex', margin: '5px 0 0', fontSize: 13, alignItems: 'center' }}>
            <p style={{ width: 60, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }} onClick={this.props.onClick}>{display_username}</p>
            <Tooltip title={formatMessage({ id: 'account.logout_tooltip' })}>
              <LogoutOutlined onClick={this.showConfirm} />
            </Tooltip>
          </div>
          <Spin spinning={balanceLoading}>
            <div>
              <div style={{ display: 'flex' }}>
                <Tooltip title={loginAddress}>
                  <div style={{ fontWeight: 500, width: 110, height: 20 }}>
                    <span>{short_address || formatMessage({ id: 'account.visitor_mode' })}</span>
                  </div>
                </Tooltip>
                <Tooltip title={formatMessage({ id: 'account.copy_address' })}>
                  <CopyOutlined onClick={() => copyToClipboard(loginAddress)} style={{ fontWeight: 500, marginLeft: 0 }} />
                </Tooltip>
              </div>
              <div style={{ display: 'flex', fontWeight: 500 }}>
                <div style={{ margin: 0, fontSize: 13, width: 110 }}>
                  FAX: {faxBalance}
                </div>

                {
                  !isMetamask ?
                    <Popover
                      title={formatMessage({ id: 'account.get_token' })}
                      content={<div>
                        <div style={{ display: 'flex', marginBottom: 10 }}>
                          <div style={{ width: 120 }}>
                            {formatMessage({ id: 'account.login_reward_token' })}
                          </div>
                          <Button
                            size="small"
                            type="primary"
                            disabled={loginReward}
                            loading={loginRewardLoading}
                            onClick={this.getLoginReward}
                          >
                            {loginReward ? formatMessage({ id: 'account.gotten_token' }) : formatMessage({ id: 'account.to_get_token' })}
                          </Button>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div style={{ width: 120 }}>
                            {formatMessage({ id: 'account.register_reward_token' })}
                          </div>
                          <Button
                            size="small"
                            type="primary"
                            disabled={registerReward}
                            loading={registerRewardLoading}
                            onClick={this.getRegisterReward}
                          >
                            {registerReward ? formatMessage({ id: 'account.gotten_token' }) : formatMessage({ id: 'account.to_get_token' })}
                          </Button>
                        </div>
                      </div>}
                    >
                      <InfoCircleOutlined style={{ fontWeight: 500 }} />
                    </Popover>
                    :
                    null
                }
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
