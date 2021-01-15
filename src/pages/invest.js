import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-locale';
import NeedLogin from '@/pages/home/NeedLogin';
import {
  message, Spin, Statistic, Row, Col, Divider, Button, Tooltip, Modal, Table, Form, Input, InputNumber,
} from 'antd';
import { ShoppingCartOutlined, InfoCircleOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

const Invest = (props) => {
  const { dispatch, invest, loading } = props;
  const {
    totalInvested, totalUsers, contractBalance, contractBalanceRate, userDeposits, userInvested,
    userDepositDetail, userDividends, referrer, referralBonus, investModal, userWithdrawn
  } = invest;
  const userLoading = loading.effects['invest/refreshUserInfo'];
  const contractLoading = loading.effects['invest/refreshContractInfo'];
  const investing = loading.effects['invest/invest'];

  const [form] = Form.useForm();
  const [depositModal, setDepositModal] = useState(false);
  const refresh = useCallback(() => {
    dispatch({ type: 'invest/refreshUserInfo' });
    dispatch({ type: 'invest/refreshContractInfo' });
  }, []);
  useEffect(() => {
    refresh();
  }, []);
  const showDepositModal = useCallback(() => {
    setDepositModal(true);
  }, []);
  const hideDepositModal = useCallback(() => {
    setDepositModal(false);
  }, []);
  const showInvestModal = useCallback(() => {
    dispatch({ type: 'invest/showInvestModal' });
  }, []);
  const hideInvestModal = useCallback(() => {
    dispatch({ type: 'invest/hideInvestModal' });
  }, []);
  const submitForm = useCallback(() => {
    form
      .validateFields()
      .then(values => {
        dispatch({ type: 'invest/invest', payload: values });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }, []);
  const withdrawAll = useCallback(() => {
    dispatch({ type: 'invest/withdraw' });
  }, []);

  const contractColProp = { xs: 12, sm: 12, md: 6, lg: 6 };
  const depositColumns = [
    { title: 'amount', key: 'amount', dataIndex: 'amount' },
    { title: 'withdrawn', key: 'withdrawn', dataIndex: 'withdrawn' },
    { title: 'start', key: 'start', dataIndex: 'start' },
  ];
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };

  return (
    <NeedLogin>
      <Spin spinning={userLoading || contractLoading} size="large">
        <div style={{ padding: 32 }}>
          <Row gutter={{ xs: 8, sm: 8, md: 16, lg: 32}} justify="space-around">
            <Col span={24}>
              <h2 style={{ textAlign: 'center' }}>
                {formatMessage({ id: 'invest.contract_title' })} <Button type="primary" onClick={refresh} shape="circle" size="large"><ReloadOutlined /></Button>
              </h2>
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.contract_total_invest' })} value={totalInvested} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.contract_total_user' })} value={totalUsers} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.contract_balance' })} value={contractBalance} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.contract_balance_rate' })} value={contractBalanceRate} />
            </Col>
          </Row>
          <Divider />
          <Row gutter={{ xs: 8, sm: 8, md: 16, lg: 32}} justify="start">
            <Col span={24}>
              <h2 style={{ textAlign: 'center' }}>{formatMessage({ id: 'invest.user_title' })}</h2>
            </Col>
            <Col {...contractColProp}>
              <Statistic
                title={formatMessage({ id: 'invest.user_invest' })}
                value={userInvested}
                suffix={
                  <>
                    <Tooltip title="invest" placement="right">
                      <Button type="primary" size="small" shape="circle" onClick={showInvestModal}><ShoppingCartOutlined /></Button>
                    </Tooltip>
                    <Tooltip title="withdraw" placement="right">
                      <Button type="primary" size="small" shape="circle" onClick={withdrawAll} style={{ marginLeft: 8 }}><WalletOutlined /></Button>
                    </Tooltip>
                  </>
                }
              />
            </Col>
            <Col {...contractColProp}>
              <Statistic
                title={formatMessage({ id: 'invest.user_deposit' })}
                value={userDeposits}
                suffix={
                  <Tooltip title="show deposit info" placement="right">
                    <Button type="primary" size="small" shape="circle" onClick={showDepositModal}><InfoCircleOutlined /></Button>
                  </Tooltip>
                }
              />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.user_dividend' })} value={userDividends} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.user_referral_bonus' })} value={referralBonus} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.user_total_withdraw' })} value={userWithdrawn} />
            </Col>
            <Col {...contractColProp}>
              <Statistic title={formatMessage({ id: 'invest.user_referrer' })} value={referrer} formatter={(v) => (v === '' ? 'None' : v)} />
            </Col>
          </Row>
        </div>
      </Spin>
      <Modal title="deposit details" visible={depositModal} onCancel={hideDepositModal} onOk={hideDepositModal}>
        <Table rowKey="start" columns={depositColumns} size="small" dataSource={userDepositDetail} />
      </Modal>
      <Modal
        visible={investModal}
        title="Invest"
        onCancel={hideInvestModal}
        onOk={submitForm}
        maskClosable={false}
        closable={false}
        okButtonProps={{ loading: investing }}
      >
        <Form form={form} {...formItemLayout}>
          <FormItem label="Referrer" name="referrer" rules={[{ required: true, message: 'referrer can not be null!' }, { pattern: /^(0x[a-fA-F,0-9]{40})$/, message: 'wrong referrer address format' }]}>
            <Input placeholder="referrer address" />
          </FormItem>
          <FormItem label="Value" name="value" extra="ether(min: 1)" rules={[{ required: true, message: 'referrer can not be null!' }]}>
            <InputNumber min={1} />
          </FormItem>
        </Form>
      </Modal>
    </NeedLogin>
  );
}

export default connect((state) => ({
  loading: state.loading,
  invest: state.invest,
}))(Invest);
