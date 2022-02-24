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
      const { location } = props;
      const { pathname, query } = location || {};
      let q = {};
      if (query) {
        q = { ...query, redirect_uri: pathname };
      }
      message.warning(formatMessage({ id: 'need_login' }));
      this.props.dispatch(routerRedux.push({ pathname: '/', query: q }))
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
