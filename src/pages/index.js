import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import { routerRedux } from 'dva/router'
import { Button, Form, Input, Spin, Modal, AutoComplete, Alert, Tooltip, Radio, message } from 'antd';
import { UserOutlined, SettingOutlined, LockOutlined, LoginOutlined, FundOutlined, PhoneOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { formatTime, LOCALE_CN, LOCALE_EN } from '@/app/util';
import styles from './index.css';
import WalletConnectSvg from '@/assets/walletconnect.svg';
import PolkadotSvg from '@/assets/polkadot-js.svg';
import MetamaskSvg from '@/assets/metamask-fox.svg';

const FormItem = Form.Item;

class LoginPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      comfirmCallModal: false,
      ensName: '',
      nameError: '',
      address: '',
      password: '',
      signInWithENS: true,

      settingModule: false,
      ethereumNode: '',
      swarmNode: '',
      apiNode: '',
      substrateAddress: undefined,
      substrateProviderUrl: '',
    }
  }

  componentDidMount() {
    // document.getElementById('container').style = 'padding-top: 85px; display: flex; flex-wrap: wrap; justify-content: center; justify-items: center';
    // document.getElementById('root').style = 'width:540px; padding-bottom: 100px';
    this.props.dispatch({ type: 'account/getLocalAccount' });
  }

  openSetting = () => {
    this.setState({ settingModule: true });
  }

  setConfig = () => {
    const { ethereumNode, swarmNode, apiNode, substrateProviderUrl } = this.state;
    console.log(ethereumNode, swarmNode, apiNode, substrateProviderUrl);
    this.setState({ settingModule: false })
    this.props.dispatch({ type: 'init/resetNode', payload: { ethereumNode, swarmNode, apiNode, substrateProviderUrl } });
  }

  goVisitorMode = () => {
    this.props.dispatch({ type: 'account/loginInVisitorMode' })
  }

  handleSubmit = () => {
    const { address, password, ensName, signInWithENS } = this.state;
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
    if (signInWithENS && !(ensName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(ensName))) {
      alert(formatMessage({ id: 'index.ens_format_error' }));
      return;
    }
    if (signInWithENS && queryENSAvaiable) {
      alert(formatMessage({ id: 'index.ens_not_registered' }));
      return;
    }
    // check address error
    if (!signInWithENS && !(address && /^0x[0-9a-fA-F]{40}$/.test(address))) {
      alert(formatMessage({ id: 'index.address_format_error' }))
      return;
    }

    // submit
    const { location: { query } } = this.props;
    if (signInWithENS) {
      this.props.dispatch({ type: 'account/loginWithEns', payload: { ensName, password, query } })
    } else {
      this.props.dispatch({ type: 'account/loginWithAddress', payload: { address, password, query } })
    }
  }

  register = () => {
    this.props.dispatch(routerRedux.push('/register'))
  }

  searchAddress = (v) => {
    // console.log(v)
  }

  searchEns = (v) => {
    // console.log(v)
  }

  onENSNameChange = (queryENSName) => {
    if (queryENSName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(queryENSName)) {
      this.setState({ ensName: queryENSName, nameError: '' })
      this.props.dispatch({ type: 'account/checkENSNameAvaiable', payload: queryENSName })
    } else {
      this.setState({ nameError: formatMessage({ id: 'index.ens_format_error' }), ensName: queryENSName })
    }
  }

  switchToAddressLogin = () => {
    this.setState({ signInWithENS: false })
  }

  switchToENSLogin = () => {
    this.setState({ signInWithENS: true })
  }

  connectMetamask = () => {
    const { dispatch, location: { query } } = this.props;
    dispatch({ type: 'account/loginWithMetamask', payload: { query } });
  }

  connectWalletConnect = () => {
    const { dispatch, location: { query } } = this.props;
    dispatch({ type: 'account/loginWithWalletConnect', payload: { query } });
  }
  connectSubstrate = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'account/loginWithSubstrate' });
  }

  onSubstrateChange = (e) => {
    this.setState({ substrateAddress: e.target.value });
  }

  confirmConnectSubstrate = () => {
    const { substrateAddress } = this.state;
    if (!substrateAddress) {
      message.info('please choose one account');
      return;
    }

    const { dispatch, account: { substrateAccounts } } = this.props;
    const account = substrateAccounts.filter(item => item.address === substrateAddress)[0];
    dispatch({ type: 'account/chooseSubstrateAccount', payload: { account } });
  }

  cancelConnectSubstrate = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'account/saveSubstrateModal', payload: { substrateModal: false } });
    dispatch({ type: 'account/saveSubstrateAccounts', payload: { substrateAccounts: [] } });
  }

  render() {
    const { loading } = this.props;
    const { providerURL, bzzURL, apiURL, substrateProviderUrl, metamaskOk } = this.props.init;
    const {
      loginLoading, ensLoading, localAccounts, queryENSAvaiable, queryENSLoading, ensUserList,
      substrateAccounts, substrateModal,
    } = this.props.account;
    const { comfirmCallModal, ensName, nameError, signInWithENS, settingModule } = this.state;

    const connectingMetamask = loading.effects['account/loginWithMetamask'];
    const connectingSubstrate = loading.effects['account/loginWithSubstrate'];
    const connectingWalletConnect = loading.effects['account/loginWithWalletConnect'];
    const loginTip = ensLoading ? formatMessage({ id: 'index.search_ens' }) : loginLoading ? formatMessage({ id: 'index.verify_password' }) : '';
    const errorMessage = signInWithENS && ensName ? nameError ? nameError : (queryENSAvaiable || queryENSLoading || !ensName) ? formatMessage({ id: 'index.ens_not_registered' }) : '' : '';
    const ensNameCheck = null;

    const options = localAccounts.map(group => (
      {
        label: <strong style={{ fontSize: 14 }}>{group.provider && group.provider.split('//').length > 1 && group.provider.split('//')[1]}</strong>,
        options: group.addressList.map(obj => ({
          label:
            <div>
              <div>{obj.address}</div>
              <div style={{ fontSize: 12, textAlign: 'right', color: '#c8c8c8' }}>{formatMessage({ id: 'last_time' })}{obj.login ? formatMessage({ id: 'login' }) : formatMessage({ id: 'register' })} {formatTime(obj.time)}</div>
            </div>,
          value: obj.address
        }))
      }
    ));

    const ensOptions = ensUserList.map(group => (
      {
        label: <strong style={{ fontSize: 14 }}>{group.provider && group.provider.split('//').length > 1 && group.provider.split('//')[1]}</strong>,
        options: group.ensList.map(obj => ({
          label:
            <div>
              <div style={{ fontSize: 16 }}>{obj.ens}</div>
              <div style={{ fontSize: 12, textAlign: 'right', color: '#c8c8c8' }}>{formatMessage({ id: 'latest_use' })} {formatTime(obj.time)}</div>
            </div>,
          value: obj.ens.split('.')[0]
        }))
      }
    ));

    const locale = localStorage.getItem('umi_locale');
    const enLocale = (locale === LOCALE_EN);
    const oLocale = enLocale ? LOCALE_CN : LOCALE_EN;
    const oLocaleDes = enLocale ? 'CH' : 'EN';

    return (
      <div>
        <div className={styles.menu} style={{ textAlign: 'center' }}>
          <a href={enLocale ? 'pages/whitepaperEN.html' : 'pages/whitepaper.html'} style={{color:'#989A9C', width:'25%',marginRight: "5%" }}>{formatMessage({ id: 'index.white_paper' })}</a>
          {/*<a href={enLocale ? 'https://beagle.gitbook.io/beagle-dao/' : 'https://beagle.gitbook.io/beagle-dao/'} style={{color:'#989A9C', width:'25%',marginRight: "5%" }}>{formatMessage({ id: 'index.white_paper' })}</a>*/}
          <a href={enLocale ? 'pages/faqEN.html' : 'pages/faq.html'} style={{ color:'#989A9C',  width:'20%', marginRight: '5%' }}>{formatMessage({ id: 'index.faq' })}</a>
          {/*<a href={enLocale ? 'pages/downloadEN.html' : 'pages/download.html'} style={{ color:'#989A9C',  width:'20%',marginRight: '5%' }}>{formatMessage({ id: 'index.download' })}</a>*/}
          <a href="https://apps.apple.com/us/app/beagle/id1597429120"  target="_blank" style={{ color:'#989A9C',  width:'20%',marginRight: '5%' }} rel="noreferrer">{formatMessage({ id: 'index.download' })}</a>
          <a href={`/?locale=${oLocale}`} style={{ color:'#989A9C',  width:'20%',marginRight: '5%' }}>{oLocaleDes}</a>
          <a href={this.openSetting}  onClick={this.openSetting} style={{ color:'#989A9C',  width:'20%',marginRight: '5%' }}>OPT</a>
        </div>
        <div className={styles.container}>
          {/*<div style={{ display: 'flex', justifyContent: 'flex-end' }}>*/}
          {/*  <Tooltip title={formatMessage({ id: 'index.config_peer' })}>*/}
          {/*    <SettingOutlined style={{ fontSize: 19, cursor: 'pointer' }} onClick={this.openSetting} />*/}
          {/*  </Tooltip>*/}
          {/*</div>*/}
          <div style={{ textAlign: 'center' }}>
            <img src="../image/happy_beagles.jpg" alt="" width="200" style={{ marginBottom: 5 }} />
            <h2 style={{ marginBottom: 0, marginTop:0, fontWeight: 900 }}>Beagle Chat</h2>
            <p style={{ marginBottom: 30,color:'#989A9C' }}>Connect people in the metaverse</p>
            {/*<p>{formatMessage({ id: 'index.description' })}</p>*/}
          </div>
          <Spin spinning={loginLoading || ensLoading} tip={loginTip}>
            <Form onFinish={this.handleSubmit} className="login-form" >
              {signInWithENS
                ? <FormItem>
                  <AutoComplete
                    dropdownMatchSelectWidth={false}
                    options={ensOptions}
                    onSearch={this.searchEns}
                    onChange={this.onENSNameChange}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder={formatMessage({ id: 'index.ens_name' })}
                      addonAfter=".beagles"
                      suffix={ensNameCheck}
                    />
                  </AutoComplete>
                  {errorMessage
                    ? <div style={{ margin: '10px 0' }}>
                      <Alert message={errorMessage} type="error" />
                    </div>
                    : null}
                </FormItem>
                : <FormItem>
                  <AutoComplete
                    dropdownMatchSelectWidth={false}
                    options={options}
                    onSearch={this.searchAddress}
                    onChange={(val) => this.setState({ address: val })}
                  >
                    <Input
                      prefix={<UserOutlined style={{border:'0px',borderRadius:12, color: 'rgba(0,0,0,.25)' }} />}
                      placeholder={formatMessage({ id: 'index.account_address' })}
                    />
                  </AutoComplete>
                </FormItem>}

              <FormItem>
                <Input
                  prefix={<LockOutlined style={{ border:'0px',borderRadius:12,color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder={formatMessage({ id: 'password' })}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </FormItem>
              {/*<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>*/}
              {/*  <a onClick={this.goVisitorMode}><LoginOutlined style={{ marginRight: 10 }} />{formatMessage({ id: 'index.visitor' })}</a>*/}
              {/*  {signInWithENS*/}
              {/*    ? <a onClick={this.switchToAddressLogin}>{formatMessage({ id: 'index.wallet_login' })}</a>*/}
              {/*    : <a onClick={this.switchToENSLogin}>{formatMessage({ id: 'index.ens_login' })}</a>}*/}
              {/*</div>*/}
              <FormItem>
                {/*<Button disabled={connectingMetamask} onClick={this.register} style={{ width: '45%', marginRight: '10%', backgroundColor: 'rgba(58, 141, 218, 0.2)' }}>*/}
                {/*  {formatMessage({ id: 'index.get_wallet' })}*/}
                {/*</Button>*/}
                <Button disabled={connectingMetamask} type="primary" htmlType="submit" style={{ width: '100%', border:'0px',borderRadius:12,background:'#352E50' }}>
                  {formatMessage({ id: 'index.login' })}
                </Button>
              </FormItem>
              {
                metamaskOk ?
                  <FormItem>
                    <Button loading={connectingMetamask} onClick={this.connectMetamask} block  danger style={{ width: '100%', borderRadius:12 }}><img src={MetamaskSvg} alt="" width="20" style={{ marginRight: 8}} />{formatMessage({ id: 'index.metamaskconnect' })}</Button>
                  </FormItem>
                  :
                  null
              }
              <FormItem>
                <Button loading={connectingSubstrate} onClick={this.connectWalletConnect} block  type='primary' ghost style={{ width: '100%', borderRadius:12 }}><img src={WalletConnectSvg} alt="" width="20" style={{ marginRight: 8 }} />{formatMessage({ id: 'index.walletconnect' })}</Button>
              </FormItem>
              <FormItem>
                <Button disabled={connectingMetamask} onClick={this.register} style={{ width: '100%',  color:'#352E50',border:0, borderRadius:12, marginRight: '10%' }}>
                  {formatMessage({ id: 'index.get_wallet' })}
                </Button>
                {/*<Button loading={connectingSubstrate} onClick={this.register} block  type='primary' ghost style={{ width: '100%', borderRadius:12 }}><img src={WalletConnectSvg} alt="" width="20" style={{ marginRight: 8 }} />{formatMessage({ id: 'index.walletconnect' })}</Button>*/}
              </FormItem>
              {/*<FormItem>*/}
              {/*  <Button loading={connectingSubstrate} onClick={this.connectSubstrate} block  danger type="dashed"><img src={PolkadotSvg} alt="" width="20" style={{ marginRight: 8 }} />{formatMessage({ id: 'index.substrateconnect' })}</Button>*/}
              {/*</FormItem>*/}

            </Form>
          </Spin>


          <Modal
            title={<div><PhoneOutlined style={{ transform: 'rotate(90deg)', color: '#5190ff', fontSize: 20 }} />{formatMessage({ id: 'index.use_callpass_to_communicate' })}</div>}
            visible={comfirmCallModal}
            onOk={() => this.setState({ comfirmCallModal: false })}
            onCancel={() => this.setState({ comfirmCallModal: false })}
            okText={<a onClick={() => this.setState({ comfirmCallModal: false })}
                       target="view_window"
                       href="https://www.callpass.cn/btncall?key=4f04aa92-972e-4bd7-b5f0-a6789b50620a&from=https://t.callt.net">
              <PhoneOutlined style={{ transform: 'rotate(90deg)', color: '#ffffff', fontSize: 20 }} />
              <span>{formatMessage({ id: 'yes' })}</span>
            </a>}
            cancelText={<div style={{ color: '#dc3545' }}><PhoneOutlined style={{ transform: 'rotate(225deg)', fontSize: 20 }} /> <span>{formatMessage({ id: 'cancel' })}</span> </div>}
          >
            <div style={{ textAlign: 'center', fontSize: 16, }}>
              {formatMessage({ id: 'index.confirm_call_allcom' })}
            </div>
          </Modal>

          <Modal
            title={formatMessage({ id: 'index.config_peer' })}
            visible={settingModule}
            onOk={this.setConfig}
            onCancel={() => this.setState({ settingModule: false })}
            okText={formatMessage({ id: 'confirm' })}
            cancelText={formatMessage({ id: 'cancel' })}
          >
            <FormItem label={formatMessage({ id: 'index.eth_peer' })}>
              <Input
                ref={e => this.ethereumInput = e}
                defaultValue={providerURL}
                onChange={(e) => this.setState({ ethereumNode: e.target.value })}
              />
            </FormItem>
            <FormItem label={formatMessage({ id: 'index.swarm_peer' })}>
              <Input
                ref={e => this.swarmInput = e}
                defaultValue={bzzURL}
                onChange={(e) => this.setState({ swarmNode: e.target.value })}
              />
            </FormItem>
            <FormItem label={formatMessage({ id: 'index.api_peer' })}>
              <Input
                ref={e => this.apiInput = e}
                defaultValue={apiURL}
                onChange={(e) => this.setState({ apiNode: e.target.value })}
              />
            </FormItem>
            {/*<FormItem label={formatMessage({ id: 'index.substrate_rpc_peer' })}>*/}
            {/*  <Input*/}
            {/*    defaultValue={substrateProviderUrl}*/}
            {/*    onChange={(e) => this.setState({ substrateProviderUrl: e.target.value })}*/}
            {/*  />*/}
            {/*</FormItem>*/}
          </Modal>
          <Modal
            title="Choose account"
            visible={substrateModal}
            maskClosable={false}
            closable={false}
            okText="Confirm"
            cancelText="Cancel"
            onOk={this.confirmConnectSubstrate}
            onCancel={this.cancelConnectSubstrate}
          >
            <Radio.Group onChange={this.onSubstrateChange}>
              {
                substrateAccounts.map((item) => {
                  return (
                    <Radio key={item.address} value={item.address} style={{ marginTop: 4 }}>
                      <span style={{ fontWeight: 'bold' }}>{item.meta.name}</span>: {item.address}
                    </Radio>
                  );
                })
              }
            </Radio.Group>
          </Modal>
        </div>
        <p className={styles.copyright}>Copyright © 2020-2022 <a href="https://www.beagledao.finance" style={{color:'#352E50'}}>{formatMessage({ id: 'allcom' })}</a></p>
          {/*<p className={styles.beian}><a href="https://beian.miit.gov.cn/" target="_blank"> 沪ICP备14021271号-4</a></p>*/}
        <p className={styles.beian }> beagles.eth on
          <a href="https://app.ens.domains/name/beagles.eth" target={'_blank'} style={{fontWeight:'bold'}} rel="noreferrer" > ENS </a>
          and <a href="https://ens.dns3.xyz/name/beagles.eth"  target={'_blank'} style={{fontWeight:'bold'} } rel="noreferrer"> L2</a>
          <a href={enLocale ? 'pages/privacyEN.html' : 'pages/privacy.html'} style={{ color:'#989A9C'}}>  {formatMessage({ id: 'index.privacy' })}</a>
        </p>
        <div className={styles.status} style={{ textAlign: 'center' }}>
          {/*<p style={{ marginBottom: 0 }}>{formatMessage({ id: 'index.encrypt_coin' })}</p>*/}
          {/*<p>{formatMessage({ id: 'index.digital_currency' })}</p>*/}

          <a href="http://app.beagledao.finance:3000/" target="_blank" style={{color:'#352E50'}} rel="noreferrer">{formatMessage({ id: 'index.network_status' })}</a>
          <p style={{ marginBottom: 0 }}>
            {/*<span>{formatMessage({ id: 'index.contact' })}:</span>*/}
            {/*<PhoneOutlined style={{ transform: 'rotate(90deg)', color: '#5190ff' }} />*/}
            {/*<a onClick={() => this.setState({ comfirmCallModal: true })}>021-50808850</a>*/}
          </p>
          {/*<a href="mailto:support@callus.app">support@callus.app</a>*/}
        </div>

      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    account: state.account,
    init: state.init,
    loading: state.loading,
  }
}

export default connect(mapStateToProps)(LoginPage);
