import React, { Component } from 'react';
import { routerRedux } from 'dva/router'
import { connect } from 'dva';
import Wallet from 'ethereumjs-wallet';
import { Button, Form, Input, Spin, Alert, Tooltip, Checkbox, Modal } from 'antd';
import {
  LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ArrowLeftOutlined, UserAddOutlined, LockOutlined, PlusOutlined
} from '@ant-design/icons';
import { showNotification, converEther } from '@/app/util';
import styles from './index.css';
import { formatMessage } from 'umi-plugin-locale';

const FormItem = Form.Item;
const { TextArea } = Input;

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ensName: '',
      password: '',
      skipEnsName: false,
      nameError: '',

      showImportModal: false,
      keystore: '',
      privateKey: '',
      pkPassword: '',
      pkError: '',
      pkOK: false,
      exportAddress: '',
    }
  }

  componentDidMount() {
    //document.getElementById('container').style = 'padding-top: 85px; display: flex; flex-wrap: wrap; justify-content: center; justify-items: center';
    //document.getElementById('root').style = 'width:540px; padding-bottom: 100px';
  }

  openImportModal = () => {
    this.setState({ showImportModal: true, privateKey: '', pkPassword: '', pkError: '', pkOK: false, exportAddress: '', })
  }

  closeImportModal = () => {
    this.setState({ showImportModal: false, privateKey: '', pkPassword: '', pkError: '', pkOK: false, exportAddress: '', })
  }

  onPrivateKeyChange = (e) => {
    let privateKey = e.target.value;
    this.setState({ privateKey })

    // start with 0x
    if (/^0x[0-9a-fA-F]*$/.test(privateKey)) {
      privateKey = privateKey.substring(2);
    }

    // private key should be 64 hex bit
    if (privateKey.length == 64) {
      try {
        const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))
        const exportAddress = wallet.getAddressString();
        this.setState({ exportAddress, pkOK: true, pkError: '' })
        this.props.dispatch({ type: 'account/getAccountBalance', payload: exportAddress })
      } catch (e) {
        this.setState({ pkError: formatMessage({ id: 'register.pk_error' }), pkOK: false, exportAddress: '', })
        console.log('private key format error')
        console.log(e)
      }
    } else {
      this.setState({ pkError: formatMessage({ id: 'register.pk_format_error' }), pkOK: false, exportAddress: '', })
    }

  }

  onPkPasswordChange = (e) => {
    this.setState({ pkPassword: e.target.value })
  }

  importPrivateKey = () => {
    const { privateKey, pkPassword, pkOK, pkError } = this.state;
    if (!pkPassword) {
      alert(formatMessage({ id: 'index.password_not_null' }));
      return;
    }
    if (!pkOK) {
      showNotification('importPrivateKey', 'error', pkError, 8)
      return;
    }
    this.props.dispatch({ type: 'account/importPrivateKey', payload: { privateKey, password: pkPassword } })
    this.setState({showImportModal: false})
  }

  handleSubmit = () => {
    const { ensName, password, skipEnsName } = this.state;
    const { queryENSAvaiable } = this.props.account;
    const { providerOK, providerURL } = this.props.init;
    // check password
    if (password === undefined || password === '') {
      alert(formatMessage({ id: 'index.password_not_null' }));
      return;
    }
    // check provider
    if (!providerOK) {
      alert(`${formatMessage({ id: 'index.provider_error_prefix' })} ${providerURL} ${formatMessage({ id: 'index.provider_error_suffix' })}`);
      return;
    }
    // check name error
    if (!skipEnsName && !(ensName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(ensName))) {
      alert(formatMessage({ id: 'index.ens_format_error' }));
      return;
    }
    if (!skipEnsName && !queryENSAvaiable) {
      alert(formatMessage({ id: 'register.ens_no_usable' }));
      return;
    }

    // submit
    if (!skipEnsName) {
      this.props.dispatch({ type: 'account/registerENS', payload: { ensName, password } })
    } else {
      this.props.dispatch({ type: 'account/registerWallet', payload: { password } })
    }
  }

  goback = () => {
    if (this.props.history) {
      this.props.history.goBack();
    } else {
      this.props.dispatch(routerRedux.push('/'))
    }
  }

  onENSNameChange = (e) => {
    const queryENSName = e.target.value;
    if (queryENSName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(queryENSName)) {
      this.setState({ ensName: queryENSName, nameError: '' })
      this.props.dispatch({ type: 'account/checkENSNameAvaiable', payload: queryENSName })
    } else {
      this.setState({ nameError: formatMessage({ id: 'index.ens_format_error' }) })
    }
  }

  render() {
    const { ensName, skipEnsName, nameError, showImportModal, pkError, exportAddress, pkOK } = this.state;
    const { registerLoading, queryENSLoading, queryENSAvaiable, registerENSLoading, accountEther, accountToken } = this.props.account;

    const tip = registerLoading ? formatMessage({ id: 'register.creating_address' }) : registerENSLoading ? formatMessage({ id: 'register.creating_ens' }) : '';
    const errorMessage = skipEnsName ? '' : nameError ? nameError : (queryENSAvaiable || queryENSLoading || !ensName) ? '' : formatMessage({ id: 'register.ens_no_usable' });
    const ensNameCheck = ensName
      ? queryENSLoading
        ? <Tooltip title={formatMessage({ id: 'register.searching' })}>
          <LoadingOutlined style={{ color: '#1890ff' }} />
        </Tooltip>
        : queryENSAvaiable
          ? <Tooltip title={formatMessage({ id: 'register.ens_usable' })}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
          : <Tooltip title={formatMessage({ id: 'register.ens_no_usable' })}>
            <CloseCircleOutlined style={{ color: '#f5222d' }} />
          </Tooltip>
      : null;
    return (
      <div className={styles.container}>
        <a onClick={this.goback} style={{ width: '25%', marginRight: '10%', }}>
          <ArrowLeftOutlined theme="outlined" />
          {formatMessage({ id: 'return' })}
        </a>
        <div style={{ textAlign: 'center' }}>
          <UserAddOutlined theme="outlined" style={{ fontSize: 70 }} />
          <h2 style={{ color: 'rgb(89,89,89)', fontWeight: 600 }}>{formatMessage({ id: 'register.create_address' })}</h2>
          <h3>{skipEnsName ? formatMessage({ id: 'register.set_address_password' }) : formatMessage({ id: 'register.set_address_ens_password' })}</h3>
        </div>
        <Spin spinning={registerLoading || registerENSLoading} tip={tip}>
          <Form onFinish={this.handleSubmit}>
            {!skipEnsName
              ? <div style={{ margin: '20px 0 10px' }}>
                <Input
                  prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder={formatMessage({ id: 'register.ens_username' })}
                  addonAfter=".be"
                  suffix={ensNameCheck}
                  onChange={this.onENSNameChange}
                />
              </div>
              : null}
            {errorMessage
              ? <div style={{ margin: '10px 0' }}>
                <Alert message={errorMessage} type="error" />
              </div>
              : null}

            <div style={{ margin: '20px 0' }}>
              <Input
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder={formatMessage({ id: 'password' })}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>

            <div style={{ margin: '10px 0' }}>
              <Alert message={<div>
                {formatMessage({ id: 'register.message_1' })}<br />
                {formatMessage({ id: 'register.message_2' })}<br />
                {formatMessage({ id: 'register.message_3' })}
              </div>} type="info" />
            </div>
            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <Checkbox onChange={(e) => this.setState({ skipEnsName: e.target.checked })}>{formatMessage({ id: 'register.create_address_only' })}</Checkbox>
            </div>
            <FormItem>
              <Button onClick={this.openImportModal} style={{ width: '45%', marginRight: '10%', }}>
                <PlusOutlined theme="outlined" />
                {formatMessage({ id: 'register.import_private_key' })}
              </Button>
              <Button type="primary" htmlType="submit" style={{ width: '45%' }}>
                {formatMessage({ id: 'register.create_immediately' })}
              </Button>
            </FormItem>
          </Form>
        </Spin>

        <Modal
          title={formatMessage({ id: 'register.import_private_key' })}
          visible={showImportModal}
          okText={formatMessage({ id: 'confirm' })}
          cancelText={formatMessage({ id: 'cancel' })}
          onOk={this.importPrivateKey}
          onCancel={this.closeImportModal}
          destroyOnClose={true}
        >
          <Form>
            <div>{formatMessage({ id: 'private_key' })}:</div>
            <div style={{ margin: "10px 0" }}>
              <Input
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder={formatMessage({ id: 'register.input_private_key' })}
                onChange={this.onPrivateKeyChange}
              />
            </div>

            {pkError
              ? <Alert
                message={pkError}
                type="error"
              />
              : pkOK
                ? <Alert message={<div>
                  <div>
                    <span style={{ display: "inline-block", width: 80 }}>{formatMessage({ id: 'wallet_address' })}:</span>
                    <span>{exportAddress}</span>
                  </div>
                  <div>
                    <span style={{ display: "inline-block", width: 80 }}>{formatMessage({ id: 'register.eth_amount' })}:</span>
                    <span>{converEther(accountEther).value} {converEther(accountEther).unit}</span>
                  </div>
                  <div>
                    <span style={{ display: "inline-block", width: 80 }}>{formatMessage({ id: 'register.fax_amount' })}:</span>
                    <span>{accountToken} 个</span>
                  </div>
                </div>} type="info" />
                : null}


            <div style={{ margin: "20px 0 0 0" }}>{formatMessage({ id: 'register.password' })}:</div>
            <div style={{ width: 250, margin: "10px 0 20px 0" }}>
              <Input
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder={formatMessage({ id: 'register.input_account_password' })}
                onChange={this.onPkPasswordChange}
              />
            </div>
          </Form>
        </Modal>
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
