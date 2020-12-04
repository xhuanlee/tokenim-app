import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Card, Row, Col, Button, Statistic, Input, Spin, List } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
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
      this.setState({ inputError: `${formatMessage({ id: 'status.account_format_error' })}: ${value}`, showSearchResult: true })
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
        <h1>{formatMessage({ id: 'status.search_account_info' })}</h1>
        <Search
          placeholder={formatMessage({ id: 'status.input_ens' })}
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
          <h1>{formatMessage({ id: 'status.contract_status' })}</h1>
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
                    <Statistic title={formatMessage({ id: 'status.token_amount' })} value={tokenTotalSupply} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.main_account_token_amount' })} value={tokenOwnerBalance} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{tokenName} {formatMessage({ id: 'status.token_contract' })}（ERC20）</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.token_symbol' })}</div>
                  <div>{tokenSymbol}</div>
                </div>
                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.token_version' })}</div>
                  <div>{tokenStandard}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_author' })}</div>
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
                    <Statistic title={formatMessage({ id: 'status.fax_token_amount' })} value={saleAllownce} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.eth_amount' })} value={converEther(saleContractEther).value + ' '} suffix={converEther(saleContractEther).unit} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.exchange_fax_amount' })} value={saleTokenSold} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.exchange_fax_price' })} value={converEther(saleTokenPrice).value + ' '} suffix={converEther(saleTokenPrice).unit} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{formatMessage({ id: 'status.fax_token_exchange_contract' })}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_author' })}</div>
                  <div><AddressTooltip length={20} address={saleOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.fax_decrease_account' })}</div>
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
                    <Statistic title={formatMessage({ id: 'status.fax_token_amount' })} value={imAllowance} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.reward_expense' })} value={imRewards} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={formatMessage({ id: 'status.message_profit' })} value={imMessageCount} />
                  </Col>
                </Row>
                <Divider />

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{formatMessage({ id: 'status.fax_im_token' })}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_author' })}</div>
                  <div><AddressTooltip length={20} address={imOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.fax_decrease_account' })}</div>
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
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{formatMessage({ id: 'status.ens_reg_table' })}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_author' })}</div>
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
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{formatMessage({ id: 'status.fax_sub_domain_contract' })}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.fax_domain_owner' })}</div>
                  <div><AddressTooltip length={20} address={faxDomainOwner} /></div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.resolve_contract_address' })}</div>
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
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.contract_brief' })}</div>
                  <div>{formatMessage({ id: 'status.domain_resolve_contract' })}</div>
                </div>

                <div style={{ display: 'flex', marginTop: 5, marginBottom: 5 }}>
                  <div style={{ width: 100 }}>{formatMessage({ id: 'status.fax_domain_owner' })}</div>
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
