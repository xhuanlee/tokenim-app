/*
 * ethereum_rpc_endpoint : 以太坊节点
 * swarm_http_endpoint   : Swram节点
 * api_http_endpoint     : API节点
 *
 * admin                 : 合约管理员地址（合约创建者、token所属者）
 */
//const admin_account = '0xD227AF0e36AE44e673b0143d7765Dc4dA9B64B68';
const admin_account = '0x67548a3c43819643390A9Aa5E0BCB284422DEA86';

module.exports = {
  network_id: '1515',
  chain_id:'0x4',
  ethereum_host: 'beagle.chat',
  ethereum_port: 8545,
  ethereum_rpc_endpoint: 'https://beagle.chat/eth',
  swarm_http_endpoint: 'https://beagle.chat/swarm',
  api_http_endpoint: 'https://beagle.chat/api',
  substrate_rpc_endpoint: 'wss://beagle.chat/substrate',
  substrate_shh_contract_addr: '5FBR2NTgWuNrMZQDvo7GShHAf6pvxVt3QcVFkGXVXBEh3gEG',

  admin: {
    token_admin: admin_account,
    im_admin: admin_account,
    sale_admin: admin_account,
    user_data_admin: admin_account,
    api_config_admin: admin_account,
  },
}
