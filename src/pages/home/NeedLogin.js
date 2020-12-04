import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-locale';

class NeedLogin extends Component {
  constructor(props) {
    super(props);
    const { auth, visitorMode } = this.props.account;
    if (!(auth || visitorMode)) {
      message.warning(formatMessage({ id: 'need_login' }));
      this.props.dispatch(routerRedux.push('/'))
    }
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    account: state.account,
  }
}

export default connect(mapStateToProps)(NeedLogin);
