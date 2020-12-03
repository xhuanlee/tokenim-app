import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Card, Row, Col, Button, Statistic, Input, Spin, List } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import AddressTooltip from '@/components/AddressTooltip'
import { converEther } from '@/app/util'

const Search = Input.Search;

class ContractStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearchResult: false,
      inputError: '',
    }
  }

  clearStyle() {
    window.clearAiCoin = setInterval(() => {
      console.log(new Date())
      if (document.getElementById('AiCoin')) {
        document.getElementById('AiCoin').style.display = 'none';
        clearInterval(window.clearAiCoin)
      }
    }, 500);
  }

  componentDidMount() {
    // 清除首页样式
    // document.getElementById('container').style = '';
    // document.getElementById('root').style = '';

    // this.clearStyle()
    this.refreshContractInfo();

  }

  refreshContractInfo = () => {
    this.props.dispatch({ type: 'contract/getContractInfo' })
  }

  doSearch = (value) => {
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
      this.setState({ showSearchResult: true, inputError: '' });
      this.props.dispatch({ type: 'account/getAccountBalance', payload: value });
    } else if (/^[a-zA-Z][a-zA-Z0-9\.]*$/.test(value)) {
      this.props.dispatch({ type: 'account/queryAccountBalanceByENS', payload: value })
      this.setState({ showSearchResult: true, inputError: '' });
    } else {
      this.setState({ inputError: `账户格式错误: ${value}`, showSearchResult: true })
    }
  }

  render() {
    const { showSearchResult, inputError } = this.state;
    const { accountBalancLoading, queryName, ensError, queryAccount, accountEther, accountToken } = this.props.account;
    const {
      tokenContractLoading,
      saleContractLoading,
      imContractLoading,
      ensContractLoading,
      faxDomainContractLoading,
      resolverContractLoading,
      // tokenContractError,
      // saleContractError,
      // imContractError,

      tokenAddress,
      tokenOwner,
      tokenName,
      tokenSymbol,
      tokenStandard,
      tokenTotalSupply,
      tokenOwnerBalance,

      imAddress,
      imOwner,
      imTokenAdmin,
      imRewards,
      imAllowance,
      imMessageCount,

      saleAddress,
      saleOwner,
      saleTokenAdmin,
      saleTokenPrice,
      saleTokenSold,
      saleAllownce,
      saleContractEther,

      ensAddress,
      ensOwner,
      faxDomainAddress,
      faxDomainOwner,
      faxDomainResolver,
      resolverAddress,
      resolverOwner,
    } = this.props.contract;

    return (
      <div style={{ margin: 15 }}>
        <h1>查询账户信息</h1>
        <Search
          placeholder="请输入账户地址/ENS名称"
          onSearch={this.doSearch}
          enterButton
        />
        {showSearchResult
          ? <Spin spinning={accountBalancLoading}>
            <List
              bordered
              style={{ marginTop: 10 }}
            >
              {queryName
                ? <List.Item>
                  <span style={{ fontSize: 18, fontWeight: 500, display: 'inline-block', width: 150 }}>
                    ENS Name:
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 'bold' }}>{queryName}</span>
                </List.Item>
                : null}
              <List.Item>
                <span style={{ fontSize: 18, fontWeight: 500, display: 'inline-block', width: 150 }}>
                  Address:
                </span>
                <span style={{ color: inputError || ensError ? '#ff4d4f' : '', fontSize: 16 }}>{inputError ? inputError : ensError ? ensError : queryAccount}</span>
              </List.Item>
              <List.Item>
                <span style={{ fontSize: 18, fontWeight: 500, display: 'inline-block', width: 150 }}>
                  FaxToken:
                </span>
                <span style={{ display: 'inline-block', fontSize: 16, marginRight: 20 }}>{accountToken.toLocaleString('en')}</span>
              </List.Item>
              <List.Item>
                <span style={{ fontSize: 18, fontWeight: 500, display: 'inline-block', width: 150 }}>
                  Ether:
                </span>
                <span style={{ display: 'inline-block', fontSize: 16, marginRight: 20 }}>{converEther(accountEther).value} {converEther(accountEther).unit}</span>
                <span style={{ display: 'inline-block', fontSize: 14 }}>({converEther(accountEther).secondValue} {converEther(accountEther).secondUnit})</span>
              </List.Item>
            </List>
          </Spin>
          : null}
        <Divider />


        <div style={{ display: 'flex' }}>
          <h1>合约状态</h1>
          <Button type="primary" shape="circle" icon={<SyncOutlined />} onClick={this.refreshContractInfo} />
        </div>
        <Row gutter={16}>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={tokenContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>FaxToken</div>
                    <AddressTooltip address={tokenAddress} />
                  </div>
                </div>
              }>
                <Row>
                  <Col span={12}>
                    <Statistic title="代币总量" value={tokenTotalSupply} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="主账号剩余代币" value={tokenOwnerBalance} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>{tokenName}代币合约（ERC20）</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>代币符号</div>
                  <div>{tokenSymbol}</div>
                </div>
                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>代币版本</div>
                  <div>{tokenStandard}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约创建者</div>
                  <div><AddressTooltip length={20} address={tokenOwner} /></div>
                </div>

              </Card>
            </Spin>
          </Col>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={saleContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>FaxTokenSale</div>
                    <AddressTooltip address={saleAddress} />
                  </div>
                </div>
              }>
                <Row>
                  <Col span={12}>
                    <Statistic title="合约可用FAX数量" value={saleAllownce} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="账户Ether数量" value={converEther(saleContractEther).value + ' '} suffix={converEther(saleContractEther).unit} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Statistic title="已兑换FAX数量" value={saleTokenSold} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="兑换价格/FAX" value={converEther(saleTokenPrice).value + ' '} suffix={converEther(saleTokenPrice).unit} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>{'FaxToken兑换合约'}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约创建者</div>
                  <div><AddressTooltip length={20} address={saleOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>FAX代扣账户</div>
                  <div><AddressTooltip length={20} address={saleTokenAdmin} /></div>
                </div>
              </Card>
            </Spin>
          </Col>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={imContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>FaxTokenIM</div>
                    <AddressTooltip address={imAddress} />
                  </div>
                </div>
              }>
                <Row>
                  <Col span={24}>
                    <Statistic title="合约可用FAX数量" value={imAllowance} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Statistic title="奖励开销（FAX）" value={imRewards} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="消息收入（FAX）" value={imMessageCount} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>FaxTokenIM即时消息合约</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约创建者</div>
                  <div><AddressTooltip length={20} address={imOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>FAX代扣账户</div>
                  <div><AddressTooltip length={20} address={imTokenAdmin} /></div>
                </div>
              </Card>
            </Spin>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={ensContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>ENSRegigtry</div>
                    <AddressTooltip address={ensAddress} />
                  </div>
                </div>
              }>
                {/* <Row>
                  <Col span={12}>
                    <Statistic title="ENS" value={''} />
                  </Col>
                </Row>
                <Divider /> */}

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>ENS注册表</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约创建者</div>
                  <div><AddressTooltip length={20} address={ensOwner} /></div>
                </div>

              </Card>
            </Spin>
          </Col>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={faxDomainContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>FIFSReigstrar</div>
                    <AddressTooltip address={faxDomainAddress} />
                  </div>
                </div>
              }>
                {/* <Row>
                  <Col span={24}>
                    <Statistic title="域名" value={'fax'} />
                  </Col>
                </Row>
                <Divider /> */}

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>{'fax子域名注册合约'}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>fax域名所有者</div>
                  <div><AddressTooltip length={20} address={faxDomainOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>解析合约地址</div>
                  <div><AddressTooltip length={20} address={faxDomainResolver} /></div>
                </div>
              </Card>
            </Spin>
          </Col>
          <Col span={8} lg={8} md={12} sm={24} xs={24} style={{ paddingTop: 20 }}>
            <Spin spinning={resolverContractLoading}>
              <Card title={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>PublicResolver</div>
                    <AddressTooltip address={resolverAddress} />
                  </div>
                </div>
              }>
                {/* <Row>
                  <Col span={24}>
                    <Statistic title="Publick Resolver" value={''} />
                  </Col>
                </Row>
                <Divider /> */}

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>合约简介</div>
                  <div>域名解析合约</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>fax域名所有者</div>
                  <div><AddressTooltip length={20} address={resolverOwner} /></div>
                </div>

              </Card>
            </Spin>
          </Col>

        </Row>
      </div >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contract: state.contract,
    account: state.account,
  }
}

export default connect(mapStateToProps)(ContractStatus);
