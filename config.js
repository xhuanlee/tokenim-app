/*
 * ethereum_rpc_endpoint : 以太坊节点
 * swarm_http_endpoint   : Swram节点
 * api_http_endpoint     : API节点
 *
 * admin                 : 合约管理员地址（合约创建者、token所属者）
 */
const admin_account = '0xD227AF0e36AE44e673b0143d7765Dc4dA9B64B68';

module.exports = {
  network_id: '1515',
  ethereum_rpc_endpoint: 'http://gfax.f3322.org:7545',
  swarm_http_endpoint: 'http://gfax.f3322.org:8500',
  api_http_endpoint: 'http://111.231.58.73:4000',

  admin: {
    token_admin: admin_account,
    im_admin: admin_account,
    sale_admin: admin_account,
    user_data_admin: admin_account,
    api_config_admin: admin_account,
  },
}
