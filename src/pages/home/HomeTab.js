import React, { Component } from 'react';
import { connect } from 'dva'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Typography, Table, Modal, Alert, Input, message } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import {
  KeyOutlined, InfoCircleOutlined, LockOutlined, SwapOutlined, SyncOutlined, CopyOutlined,
  InteractionOutlined, ShoppingCartOutlined, AuditOutlined, FileSearchOutlined
} from '@ant-design/icons';

import IconButton from './content/component/IconButton'
import TransEther from './content/component/TransEther'
import TransFax from './content/component/TransFax'
import BuyFax from './content/component/BuyFax'
import ApproveContract from './content/component/ApproveContract'

import { converEther } from '@/app/util'

const { Title } = Typography;

class HomeTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operation: '',
      exportPk: false,
      passwordOK: false,
      passwordError: '',
      password: '',
      privateKey: '',
    }
  }

  toggleOperation = (operation) => {
    const currentOper = this.state.operation;
    if (currentOper === operation) {
      this.setState({ operation: '' })
    } else {
      this.setState({ operation })
    }
  }

  openContractStatePage = () => {
    window.open(window.location.origin + '/status');
  }

  refresh = () => {
    const { shhKeyId } = this.props.account;
    this.props.dispatch({ type: 'user/getBalance' });
    this.props.dispatch({ type: 'user/getShhState', payload: shhKeyId });
  }

  openExportModal = () => {
    this.setState({ exportPk: true })
  }

  closeExportModal = () => {
    this.setState({ exportPk: false, password: '', passwordOK: false, passwordError: '', privateKey: '' })
  }

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value, passwordError: '' })
  }

  exportPrivateKey = () => {
    const { passwordOK, password } = this.state;
    const { loginPkAes, loginPkMd5 } = this.props.account;

    // 完成
    if (passwordOK) {
      this.setState({ exportPk: false, password: '', passwordOK: false, passwordError: '', privateKey: '' })
      return;
    }

    // 无可用钱包
    if (!(loginPkAes && loginPkMd5)) {
      this.setState({ passwordOK: false, passwordError: formatMessage({ id: 'home.no_usable_wallet' }), privateKey: '' })
      return;
    }

    // 验证密码
    const wallet = window.App.vertifyPassword(loginPkAes, loginPkMd5, password);
    if (wallet) {
      const privateKey = wallet.getPrivateKeyString && wallet.getPrivateKeyString();
      this.setState({ passwordOK: true, privateKey })
    } else {
      this.setState({ passwordOK: false, passwordError: formatMessage({ id: 'home.wrong_password' }) })
    }

  }


  render() {
    const { operation, exportPk, passwordOK, passwordError, privateKey } = this.state;
    const { address, token, ether } = this.props;
    const { balanceLoading } = this.props.user;
    const { shhKeyAvaiable, shhKeyId, shhPubKey, isMetamask } = this.props.account;
    const displayEther = `${converEther(ether).value} ${converEther(ether).unit}`
    const shhStatus = shhKeyAvaiable && shhKeyId ?
      <>
        <CopyToClipboard text={shhPubKey} onCopy={() => message.success('Copied')}><Button type="dashed" shape="circle" icon={<CopyOutlined />} /></CopyToClipboard>
        {shhPubKey}
      </>
      : formatMessage({ id: 'home.offline' });
    return (
      <div style={{ margin: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>{formatMessage({ id: 'home.my_account_info' })}</Title>
          <Button type="primary" shape="circle" icon={<SyncOutlined />} onClick={this.refresh} />
        </div>
        <hr style={{ borderColor: 'rgb(232,232,232)' }} />
        {
          !isMetamask ?
            <div style={{ float: 'right' }}>
              <Button onClick={this.openExportModal} type="primary">
                <KeyOutlined />
                {formatMessage({ id: 'home.export_pk' })}
              </Button>
            </div>
            :
            null
        }
        <div style={{ marginTop: 20, marginLeft: 30, marginBottom: 40 }}>
          <Table
            style={{ width: '100%' }}
            showHeader={false}
            pagination={false}
            loading={balanceLoading}
            columns={[
              { title: '属性名', dataIndex: 'row', key: 'row', width: 100, },
              { title: '属性值', dataIndex: 'val', key: 'val', ellipsis: true },
            ]}
            dataSource={[
              { key: 'address', row: formatMessage({ id: 'home.table_account_address' }), val: address || formatMessage({ id: 'home.no_usable_wallet' }) },
              { key: 'token', row: 'Fax Token', val: token },
              { key: 'ether', row: 'Ether', val: displayEther },
              { key: 'shh', row: 'Whisper', val: shhStatus },
            ]}
          />
        </div>

        <Title level={4}>{formatMessage({ id: 'home.account_operation' })}</Title>
        <hr style={{ borderColor: 'rgb(232,232,232)' }} />
        <div style={{ margin: 30, display: 'flex' }}>
          <IconButton current={operation} okey='transEther' action={this.toggleOperation} icon={<SwapOutlined style={{ fontSize: '30px' }} />} text={formatMessage({ id: 'home.transfer_eth' })} />
          <IconButton current={operation} okey='transFax' action={this.toggleOperation} icon={<InteractionOutlined style={{ fontSize: '30px' }} />} text={formatMessage({ id: 'home.transfer_fax' })} />
          <IconButton current={operation} okey='buyFax' action={this.toggleOperation} icon={<ShoppingCartOutlined style={{ fontSize: '30px' }} />} text={formatMessage({ id: 'home.buy_fax' })} />
          <IconButton current={operation} okey='approveContract' action={this.toggleOperation} icon={<AuditOutlined style={{ fontSize: '30px' }} />} text={formatMessage({ id: 'home.approve_contract_quota' })} />
          <IconButton current={operation} okey='openContractPage' action={this.openContractStatePage} icon={<FileSearchOutlined style={{ fontSize: '30px' }} />} text={formatMessage({ id: 'home.check_contract_status' })} />
        </div>
        <div style={{ marginLeft: 50, marginRight: 220 }}>
          {operation
            ? operation === 'transEther'
              ? <TransEther />
              : operation === 'transFax'
                ? <TransFax />
                : operation === 'buyFax'
                  ? <BuyFax />
                  : operation === 'approveContract'
                    ? <ApproveContract />
                    : null
            : null}
        </div>
        <Modal
          title={formatMessage({ id: 'home.export_pk' })}
          visible={exportPk}
          onOk={this.exportPrivateKey}
          onCancel={this.closeExportModal}
          okText={passwordOK ? formatMessage({ id: 'home.finish' }) : formatMessage({ id: 'home.next_step' })}
          cancelText={formatMessage({ id: 'cancel' })}
          destroyOnClose={true}
        >
          <Alert message={
            <div>
              <InfoCircleOutlined />
              <span>{formatMessage({ id: 'home.export_pk_notice' })}</span>
            </div>
          } type="info" />
          <div style={{ margin: "20px 0" }}>
            <div style={{ marginBottom: 10 }}>
              <span>{formatMessage({ id: 'home.input_password_notice' })}</span>
            </div>
            <div style={{ width: 250 }}>
              <Input
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder={formatMessage({ id: 'home.input_password' })}
                onChange={this.onPasswordChange}
              />
            </div>
          </div>
          {passwordError
            ? <Alert message={passwordError} type="error" />
            : passwordOK
              ? <div>
                <span>Private Key</span>
                <Alert message={privateKey} type="success" />
              </div>
              : null}
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    account: state.account,
  }
}

export default connect(mapStateToProps)(HomeTab);
