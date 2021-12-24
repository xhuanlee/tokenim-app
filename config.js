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
  ethereum_host: 'app.beagledao.finance',
  ethereum_port: 8545,
  ethereum_rpc_endpoint: 'https://app.beagledao.finance/eth',
  swarm_http_endpoint: 'https://app.beagledao.finance/swarm',
  api_http_endpoint: 'https://app.beagledao.finance/api',
  substrate_rpc_endpoint: 'wss://app.beagledao.finance/substrate',
  substrate_shh_contract_addr: '5FBR2NTgWuNrMZQDvo7GShHAf6pvxVt3QcVFkGXVXBEh3gEG',

  admin: {
    token_admin: admin_account,
    im_admin: admin_account,
    sale_admin: admin_account,
    user_data_admin: admin_account,
    api_config_admin: admin_account,
  },
}
