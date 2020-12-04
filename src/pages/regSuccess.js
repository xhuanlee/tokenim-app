import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Alert, Tooltip, Button, Form } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { CheckCircleOutlined, CopyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { copyToClipboard, download } from '@/app/util'
import styles from './index.css';

const FormItem = Form.Item;

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    const { registerAddress } = this.props.account;
    if (registerAddress === undefined || registerAddress === '') {
      this.goback();
      return
    }
  }

  componentDidMount() {
    //document.getElementById('container').style = 'padding-top: 85px; display: flex; flex-wrap: wrap; justify-content: center; justify-items: center';
    //document.getElementById('root').style = 'width:540px; padding-bottom: 100px';
  }

  gotoLogin = () => {
    this.props.dispatch(routerRedux.push('/'));
  }

  goback = () => {
    if (this.props.history) {
      this.props.history.goBack();
    } else {
      this.props.dispatch(routerRedux.push('/register'))
    }
  }

  downloadKeystore = () => {
    const { wallet, registerKeystore } = this.props.account;
    if (!wallet) {
      alert(formatMessage({ id: 'regSuccess.no_wallet' }));
    } else {
      download(wallet.getV3Filename(), registerKeystore);
    }
  }

  render() {
    const { registerAddress, registerENSName } = this.props.account;
    return (
      registerAddress === undefined || registerAddress === ''
        ? <div className={styles.container}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'rgb(89,89,89)', fontWeight: 600 }}>{formatMessage({ id: 'regSuccess.redirecting' })}</h3>
          </div>
        </div>
        : <div className={styles.container}>
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 70, color: 'rgb(82, 196, 26)' }} />
            <h3 style={{ color: 'rgb(89,89,89)', fontWeight: 600 }}>{formatMessage({ id: 'regSuccess.congratulation' })}</h3>
            {registerENSName
              ? <div style={{ marginTop: 20 }}>
                <div style={{ textAlign: 'left', marginLeft: 5, fontSize: 15, fontWeight: 'bold' }}>{formatMessage({ id: 'ens_username' })}:</div>
                <Alert type="info"
                       message={<div style={{
                         wordBreak: 'break-all',
                         textAlign: 'left',
                         fontSize: 16,
                         fontWeight: 500,
                       }}>
                         {registerENSName}
                       </div>
                       }
                />
              </div>
              : null}
            <div style={{ marginTop: 20 }}>
              <div style={{ textAlign: 'left', marginLeft: 5, fontSize: 15, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                钱包地址:
                {/* <Button icon='download' size='small' onClick={this.downloadKeystore}>下载备份钱包Keystore文件</Button> */}
              </div>
              <Alert
                type="info"
                message={<div style={{
                  wordBreak: 'break-all',
                  textAlign: 'left',
                  fontSize: 16,
                  position: 'relative',
                  minHeight: 50,
                }}>
                  {registerAddress}
                  <div style={{ position: 'absolute', right: 0, bottom: 0, cursor: 'point' }}>
                    <Tooltip title={formatMessage({ id: 'regSuccess.copy_address' })}>
                      <CopyOutlined onClick={() => copyToClipboard(registerAddress)} />
                    </Tooltip>
                  </div>
                </div>} />
            </div>
            <FormItem style={{ marginTop: 24 }}>
              <Button onClick={this.goback} style={{ width: '45%', marginRight: '10%', }}>
                <ArrowLeftOutlined theme="outlined" />
                {formatMessage({ id: 'return' })}
              </Button>
              <Button type="primary" onClick={this.gotoLogin} style={{ width: '45%' }}>
                {formatMessage({ id: 'regSuccess.login_immediately' })}
              </Button>
            </FormItem>
          </div>
        </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
    init: state.init,
  }
}
export default connect(mapStateToProps)(RegisterPage);
