import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva'

import { message } from 'antd'

class NeedLogin extends Component {
  constructor(props) {
    super(props);
    const { auth, visitorMode } = this.props.account;
    if (!(auth || visitorMode)) {
      message.warning('您需要登陆访问当前资源')
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