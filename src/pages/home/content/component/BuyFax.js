import React, { Component } from 'react';
import { connect } from 'dva'
import { Form, Input, Button, Spin } from 'antd';
import { ShoppingCartOutlined, SyncOutlined } from '@ant-design/icons';

import { converEther } from '../../../../app/util';

const FormItem = Form.Item;

class BuyTokenForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faxNumber: 0,
    }
  }

  setFaxNumber = (e) => {
    this.setState({ faxNumber: e.target.value })
  }

  buyFax = () => {
    const { faxNumber } = this.state;
    this.props.dispatch({ type: 'user/buyFax', payload: { faxNumber } })
  }

  refreshSaleContract = () => {
    this.props.dispatch({ type: 'contract/getContractInfo' })
  }

  render() {
    const { saleTokenPrice, saleAllownce, saleAddress, saleContractLoading } = this.props.contract;
    const { faxNumber } = this.state;
    const cost = saleTokenPrice * faxNumber;
    return (
      <div>
        <h3>购买FAX</h3>
        <FormItem>
          <Input
            prefix={<ShoppingCartOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="请输入需要购买的FAX数量"
            addonAfter="FAX"
            onChange={this.setFaxNumber}
          />
        </FormItem>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: 5 }}>相关信息</div>
          <SyncOutlined onClick={this.refreshSaleContract} />
        </div>
        <Spin spinning={saleContractLoading}>
          <div>
            <div style={{ borderTop: 'solid 1px #d9d9d9', borderLeft: 'solid 1px #d9d9d9', borderRight: 'solid 1px #d9d9d9', backgroundColor: '#fafafa', borderTopRightRadius: 4, borderTopLeftRadius: 4 }}>
              <span style={{ display: 'inline-block', width: 125, borderRight: 'solid 1px #d9d9d9', textAlign: 'center', padding: 3 }}>FAX兑换合约地址</span>
              <span style={{ display: 'inline-block', marginLeft: 20 }}>{saleAddress}</span>
            </div>
            <div style={{ borderTop: 'solid 1px #d9d9d9', borderLeft: 'solid 1px #d9d9d9', borderRight: 'solid 1px #d9d9d9', backgroundColor: '#fafafa', }}>
              <span style={{ display: 'inline-block', width: 125, borderRight: 'solid 1px #d9d9d9', textAlign: 'center', padding: 3 }}>合约剩余FAX数量</span>
              <span style={{ display: 'inline-block', marginLeft: 20 }}>{saleAllownce}</span>
            </div>
            <div style={{ borderTop: 'solid 1px #d9d9d9', borderLeft: 'solid 1px #d9d9d9', borderRight: 'solid 1px #d9d9d9', backgroundColor: '#fafafa', borderRadius: 4, }}>
              <span style={{ display: 'inline-block', width: 125, borderRight: 'solid 1px #d9d9d9', textAlign: 'center', padding: 3 }}>FAX价格</span>
              <span style={{ display: 'inline-block', marginLeft: 20 }}>1 FAX = {converEther(saleTokenPrice).value} {converEther(saleTokenPrice).unit}</span>
            </div>
            <div style={{ border: 'solid 1px #d9d9d9', backgroundColor: '#fafafa', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginBottom: 20 }}>
              <span style={{ display: 'inline-block', width: 125, borderRight: 'solid 1px #d9d9d9', textAlign: 'center', padding: 3 }}>Ether费用</span>
              <span style={{ display: 'inline-block', marginLeft: 20 }}>{converEther(cost).value} {converEther(cost).unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='primary' onClick={this.buyFax} >
                确定购买
          </Button>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contract: state.contract,
  }
}

export default connect(mapStateToProps)(BuyTokenForm);
