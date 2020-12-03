import React, { Component } from 'react';
import { connect } from 'dva'
import { Form, Input, Button } from 'antd';
import { UserOutlined, InteractionOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

class TransFax extends Component {
  formRef = React.createRef();

  transferFax = () => {
    const address = this.formRef.current.getFieldValue('address');
    const fax = this.formRef.current.getFieldValue('fax');
    console.log(address, fax);
    this.props.dispatch({ type: 'user/transFax', payload: { to: address, fax } })
  }
  render() {
    return (
      <Form ref={this.formRef}>
        <h3>FAX转账</h3>
        <FormItem name="address">
          <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入账户地址" />
        </FormItem>
        <FormItem name="fax">
          <Input
            prefix={<InteractionOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="FAX代币数目"
            addonAfter="FAX"
          />
        </FormItem>
        <div style={{ display: 'flex', justifyContent:'flex-end'}}>
          <Button type='primary' onClick={this.transferFax} >
            确定转账
          </Button>
        </div>
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
    init: state.init,
  }
}

export default connect(mapStateToProps)(TransFax);
