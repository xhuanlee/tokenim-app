import React, { Component } from 'react';
import { connect } from 'dva'
import { Form, Input, Button, Select, Alert } from 'antd';
import { AuditOutlined } from '@ant-design/icons';

const FormItem = Form.Item;
const Option = Select.Option;

class ApproveContract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contract: '',
      faxNumber: 0,
    }
  }

  approve = () => {
    const { contract, faxNumber } = this.state;
    console.log(contract, faxNumber)
    this.props.dispatch({ type: 'user/approve', payload: { contract, faxNumber } })
  }

  changeContract = (val) => {
    this.setState({ contract: val })
  }

  changeFaxNumber = (e) => {
    this.setState({ faxNumber: e.target.value })
  }

  render() {
    const { imAddress, saleAddress } = this.props.contract;
    const { faxBalance } = this.props.user;
    return (
      <div>
        <h3>批准合约额度</h3>
        <FormItem>
          <Select onChange={this.changeContract} style={{ width: 480 }}>
            <Option value={saleAddress}>兑换合约：{saleAddress}</Option>
            <Option value={imAddress}>即时通讯：{imAddress}</Option>
          </Select>
        </FormItem>
        <FormItem style={{ width: 480 }}>
          <Input
            prefix={<AuditOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="请输入准许合约花费的FAX数量"
            onChange={this.changeFaxNumber}
            addonAfter="FAX"
          />
          <Alert message={<div>当前账户FAX个数：{faxBalance}</div>} type="info" />
        </FormItem>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type='primary' onClick={this.approve} >
            确定批准
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contract: state.contract,
    user: state.user,
  }
}

export default connect(mapStateToProps)(ApproveContract);
