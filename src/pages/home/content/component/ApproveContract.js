import React, { Component } from 'react';
import { connect } from 'dva'
import { Form, Input, Button, Select, Alert } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
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
        <h3>{formatMessage({ id: 'approve.contract_quota' })}</h3>
        <FormItem>
          <Select onChange={this.changeContract} style={{ width: 480 }}>
            <Option value={saleAddress}>{formatMessage({ id: 'approve.exchange_contract' })}：{saleAddress}</Option>
            <Option value={imAddress}>{formatMessage({ id: 'approve.im_messaging' })}：{imAddress}</Option>
          </Select>
        </FormItem>
        <FormItem style={{ width: 480 }}>
          <Input
            prefix={<AuditOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder={formatMessage({ id: 'approve.input_approve_fax_amount' })}
            onChange={this.changeFaxNumber}
            addonAfter="FAX"
          />
          <Alert message={<div>{formatMessage({ id: 'approve.account_fax_amount' })}：{faxBalance}</div>} type="info" />
        </FormItem>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type='primary' onClick={this.approve} >
            {formatMessage({ id: 'approve.confirm_approve' })}
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
