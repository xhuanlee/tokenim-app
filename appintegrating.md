# integrate IOS with tokenim-app WEB

简单的说两大目标:
- 与App绑定（添加设备）和同步数据
- 添加LICODE会议功能
#. 0. 现状
- WEB已经实现了通过metamask访问以太坊区块链实现转账、签字和授权，基于钱包地址的消息传输、直接点对点音视频通讯的功能也可以借此实现；
- IOS客户端基本实现了SFU会议功能以及点对点音视频通讯功能；
- WEB端的身份（ID）是以太坊钱包地址，消息传输是Whisper协议；
- App的身份（ID)是Carrier ID；消息传输也是Carrier网络；
- Whisper协议没有在App里实现，Carrier也无对于Web的支持；
- WEB依赖POA私有化部署的以太坊兼容链以及少数Whisper节点；
#. 1. 目标
- WEB所需智能合约部署在以太坊兼容的应用链BeagleDAO App Chain上，也可以是测试链rinkeby上，代码也切换至rinkeby上；
- 考虑同时对于BSC、以太坊主链和亦来云以太坊侧链的部署和访问；
- 在智能合约里记录用户好友关系、推荐关系、以及使用凭证等信息，为对于用户的积极行为实施奖励激励做准备；
- 在智能合约里开发会议室功能，用户可以mint（铸造）房间，记录房间的角色、主题等信息；
- 集成Licode的语音和视频会议功能，包括显示房间列表和进入会议室开会
- Web端与App可以在同一个会议室开会
- Web端与IOS客户端绑定，IOS客户端可以备份carrier好友列表到对应以太坊钱包地址的好友智能合约当中
#. 2. 合约
- 部署
## - carrier好友列表的记录和查询
## - 以太坊好友列表的记录和查询
- 会议室合约：名称、logo、介绍，类型（私有｜公开），主持人【】，发言人【】，听众【】
#. 3. SFU会议
- 保留现在的用whisper实现的公共聊天室
- 会议列表（显示在公共聊天室下面）
- 语音会议
- 视频会议
#. 4. 绑定
- Web上显示二维码
- 手机App扫描后绑定，提交本人的carrier id和address以及好友列表，Web返回以太坊地址和记录凭证号码
- Web提供接口给手机App上传手机上传更新好友列表
- IOS客户端直接集成Web3的js接口访问以太坊合约涉及到私钥的保管和使用，估计不太好做
- 考虑到没有服务器，App和Web客户端直接通过socket.io或者webrtc进行数据交换
- 用户同时打开登录电脑网页版和手机客户端才能进行数据的同步；
- App考虑与手机钱包通过Wallet Connect协议集成实现与Essiential,TP，mykey等钱包的绑定
##. 4.1 技术实现
- Web客户端与手机App通过现在离线呼叫的socket.io进行会话通讯
- Web提供一个【添加新设备】的按键，点击后展示的二维码其实是一个随机产生的socket.io的房间号和服务器地址或者编号（考虑到以后部署多个服务器），Web端同时进入该房间等待App连接
- App通过扫描获得该房间号（和服务器地址），进入该房间
- Web端提示“接受”还是“拒绝”
- 接受后，App向Web发送自己的Carrier IP和地址，以及好友的名字，备注，userid和address
- Web向App发送自己的以太坊地址和名字、头像等；
- 如果Web端有已经保存的用户好友信息，把好友信息发到App端，App插入好友数据（有个同步的问题，以手机端为准）
- 显示绑定成功；
- Web端把收到的信息提交到合约中保存

# 5.API
- IMApp.API_URL: https://app.beagledao.finance/api
-  GET_FREE_ETHER: `/getfreeEther/`,
```
      sendRequest(`${IMApp.API_URL}${ETHEREUM_API.GET_FREE_ETHER}${address}`, (err, res) => {

```
-  REGISTER_ENS: `/registerEns/`,
```
      `${IMApp.API_URL}${ETHEREUM_API.REGISTER_ENS}${this.props.account.address}/${nameValue}`,
```

# 6. Web3 智能合约调用
- 合约地址
```
  initShhDataContract: () => {
    // web3 contract instance
    const c = FaxTokenImAPI.web3.eth.contract(ShhData.abi)
    FaxTokenImAPI.web3ShhDataContract = c.at(ShhData.networks[network_id].address);

    // truffle contract instance
    const shhDataContract = contract(ShhData);
    shhDataContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      shhDataContract.deployed().then(instance => {
        FaxTokenImAPI.shhDataContract = instance;
        resolve(instance.address);
      }).catch(err => {
        reject(err);
      })
    })
  },

```
- 调用合约
```
export async function saveShhName(name) {
  try {
    const nonce = await FaxTokenImAPI.getTransactionCount(window.ethereum.selectedAddress);
    const data = FaxTokenImAPI.web3ShhDataContract.saveShhName.getData(name);
    const param = {
      nonce: window.FaxTokenImAPI.web3.toHex(nonce),
      gas: '0x15f90',
      gasPrice: '0x4a817c800',
      from: window.ethereum.selectedAddress,
      to: FaxTokenImAPI.shhDataContract.address,
      value: '0x0',
      data,
      chainId: window.ethereum.chainId,
    };
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [param],
    });
    console.log(`save shh name hash: ${txHash}`);

    window.g_app._store.dispatch({ type: 'account/saveAccountState', payload: { loginEns: name } });
  } catch (e) {
    message.error('save shh name error!');
  }
}
```
# 7. ENS
```
  initENSContract: () => {
    // web3 contract instance
    const c = FaxTokenImAPI.web3.eth.contract(ENSRegistry.abi)
    FaxTokenImAPI.web3EnsContract = c.at(ENSRegistry.networks[network_id].address);

    // truffle contract instance
    const ensRegistryContract = contract(ENSRegistry);
    ensRegistryContract.setProvider(FaxTokenImAPI.web3.currentProvider);

    return new Promise((resolve, reject) => {
      ensRegistryContract.deployed().then(instance => {
        FaxTokenImAPI.ensContract = instance;
        resolve(instance.address);
      }).catch(err => {
        reject(err);
      })
    })
  },

  getENSAddressByName: (name) => {
    return FaxTokenImAPI.ensContract.resolver.call(namehash.hash(name)).then((resolverAddr) => {
      if (resolverAddr === '0x0000000000000000000000000000000000000000') {
        throw `no resolver address for name: ${name}`;
      } else if (resolverAddr.toLowerCase() !== FaxTokenImAPI.resolverContract.address.toLowerCase()) {
        throw `resolver not supported yet (only support .fax subdomain)`
      } else {
        return FaxTokenImAPI.resolverContract.addr.call(namehash.hash(name));
      }
    })
  },

  checkENSName: (name) => {
    return FaxTokenImAPI.ensContract.owner.call(namehash.hash(`${name}.fax`))
  },
```
