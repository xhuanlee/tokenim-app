#链上账号
## 1. 目标
- 背景：
  - 传统系统的账号系统一般都在中心化服务器上实现和存储，kademlia目前没有网上的账号系统。
  - kademlia准备使用Web3的基础设施（ens，swarm，evm compatible smart contract）来实现账号的存储和管理，不依赖于具体的服务器；
- 一期目标
  - 绑定本地钱包地址：使用以太坊地址作为通讯地址，通过以太坊地址查询whisper和carrier地址
  - 使用ens域名进行通讯寻址：显示自己的名字，搜索ens名字并发起通讯
  - Profile: 
    - ens名下记录头像、名称、whisper和carrier公开地址，Web上实现，
    - App上可先用shhData实现名称和carrier公开地址的保存和查询,担心ens合约太复杂
  - Rinkeby测试网：
    - shhData合约:   0x264332fb4A47617FB0B686A6136292d5E7878eaC
      - 写
        - saveShhPubKey
        - saveShhName，建议修改对应的.sol过程，同时添加ens作为.beagles.eth的subdomain
        - saveShhKeyPriKey is not safe because every one can decode input data by looking at the transaction details of the contract call
      - 查询
        - shhPubKeyMap(address)
        - shhNameMap(address)  
      - 最好增加
        - sshAddressByName(name)  
      - https://rinkeby.etherscan.io/address/0x264332fb4a47617fb0b686a6136292d5e7878eac#writeContract
- 总目标
  - contact 通讯录
  - network 社交关系    
  - group 群
## 2. 概念
### 2.1 BAppChain
- BeagleDao App Chain
- ethereum POA blockchain with ENS, WHISPER and SWARM
### 2.2 ethereum address
- 以太坊的钱包地址作为登录授权的唯一地址
- 用户可以使用以太坊钱包的地址通过metamask或者walletConnect授权登陆，
- 也可以通过EthereumApi获得云端钱包地址和名字
- https://app.beagledao.finance/api
```
export const ETHEREUM_API = {
  GET_KEYSTORE: `/getKeystore/`,
  SAVE_KEYSTORE: `/saveKeystore/`,
  GET_FREE_ETHER: `/getfreeEther/`,
  REGISTER_ENS: `/registerEns/`,
  SET_SYM_KEY: `/userData/setSymKey/`,
  SET_SHH_KEY: `/userData/setShhKey/`,
  SET_DEVICE_TOKEN: `/userData/setDeviceToken/`,
  SEND_ANNOUNCEMENT: `/userData/sendAnnouncement`
}

- https://app.beagledao.finance/api/account/registerENS ,payload: { ensName, password }
    // check name error
    if (!skipEnsName && !(ensName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(ensName))) {
      alert(formatMessage({ id: 'index.ens_format_error' }));
      return;
    }
    if (!skipEnsName && !queryENSAvaiable) {
      alert(formatMessage({ id: 'register.ens_no_usable' }));
      return;
    }

    // submit
    if (!skipEnsName) {
      this.props.dispatch({ type: 'account/registerENS', payload: { ensName, password } })
    } else {
      this.props.dispatch({ type: 'account/registerWallet', payload: { password } })
    }

```
### 2.3 name：
- 唯一可读的名字，如ens的名字beagles.eth,tns的readyplayer.tns
- 已有ens或者tns名字直接用ens的进行验证和授权，把ens中的对应数据复制同步到BAppChain的对应ENS合约上
- 申请或者使用我们的名字，目前的后缀是.beagles.eth, 目前在我们的BAppChain链上部署有ens兼容的合约，保持ens调用方式
- 可以支持更多的顶级域名，如.btc,.sol,.bsc,.ltc
### 2.4 profile
- ens除了以太坊地址以为还可以记录text, contenthash, email、社交账号等等；
- 由于ens的gas费太高，所有操作都在我们的应用链上完成
- https://docs.ens.domains/dapp-developer-guide/resolving-names
- TEXT metadata: 记录用户的显示名字或者别称nickname,也可以用来记录carrier地址或者email address (option)
- did:elastos:ii7Tgr4tMKzeuYosetnAfPsjdbysRkzYf9
- Lens Protocol
  - https://docs.lens.dev/docs/overview
````
ens.setText('iam.alice.eth', 'nickname', 'Test record', {from: ...});
ens.setText('iam.alice.eth', 'carrieraddress', 'Test record', {from: ...});
ens.setText('iam.alice.eth', 'carrierid', 'Test record', {from: ...});
````
- Content hashes: 记录用户头像
- if you’d like to put an NFT that you own, then you enter it in with this format:  
  - eip155:1/[NFT standard]:[contract address for NFT collection]/[token ID or the number it is in the collection]
  - eip155:1/erc721:0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6/2430
- Step-by-Step Guide to Setting an NFT as your ENS Profile Avata
  - https://medium.com/the-ethereum-name-service/step-by-step-guide-to-setting-an-nft-as-your-ens-profile-avatar-3562d39567fc   
```
// Getting contenthash
web3.eth.ens.getContenthash('ethereum.eth').then(function (result) {
    console.log(result);
});
// Setting contenthash
web3.eth.ens.setContenthash('ethereum.eth', hash);
```
- 头像上传到swarm，返回值作为contentHash提交到ens
```
https://github.com/allcomsh/Ethereum/blob/master/swarm.txt
1. upload file
curl -H "Content-Type:image/jpeg" --data-binary @cat.jpg https://app.beagledao.finance/swarm/bzz:/
fb45d1e785834e3a12842c4c26e00f4c7dd78c5aafd371017717b94c79c7694d
2. view file
https://app.beagledao.finance/swarm/bzz:/83e23a04962eb6c7a2e26c10f50f76660a1c5195c0a5cffb3ecab56a1f9785f2/
```
```
 const contentHash = require('content-hash')
const encoded = 'e3010170122029f2d17be6139079dc48696d1f582a8530eb9805b561eda517e22a892c7e3f1f'
const content = contentHash.decode(encoded)
// 'QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4'

const onion = 'zqktlwi4fecvo6ri'
contentHash.encode('onion', onion);
// 'bc037a716b746c776934666563766f367269'

const encoded = 'e40101701b20d1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162'

const codec = contentHash.getCodec(encoded) // 'swarm-ns'
codec === 'ipfs-ns' // false
```
### 2.5 Contacts
记录好友的ens名字（如果有的话）或者地址
- 给好友加备注（我给好友的名字或者标签）
- 记录好友添加时间, 发其添加好友请求的时候就记录
#### 2.5.1 保存方法
- 合约:
  - BAppChain上的智能合约
  - 钱包签字授权登录
  - https://cryptomarketpool.com/address-book-solidity-smart-contract/
  - https://ethereum.stackexchange.com/questions/33166/ethereum-address-private-key-correspondance?rq=1
- IPFS or SWARM
  - 可修改：tamper-proof,creation, update,query and verification, a mutable data stream storage system on top of IPFS, refer to cyberconnect and ceramic. 
  -  we do enforce data signature with dag-jose codec so that data authenticity is guaranteed.
  - Each update to the data is appended to the data stream in the form of an append-only commit log and the resulting data structure becomes a hash linked data structure called a Merkle DAG. To provide data authenticity, we utilize dag-jose IPLD codec so that each piece of data, whether the creation file or the individual updates is signed and optionally encrypted by the data owner.   
  - 验证：authentication by a signature using a user's private key
  - 授权：authorization is done with the help of pre-commit checks and dag-jose IPLD encoding to ensure correct signing after commit.
  - 可用Availability:Data availability among nodes is achieved through libp2p pubsub so that as long as one node subscribed to the pubsub topic has the needed commit log, data will be available for query among all the nodes. 
    - https://docs.cyberconnect.me/protocol/technical-framework/
    - mutable stream of https://ceramic.network/
#### 2.5.2 隐私问题
- 加密和解密
  - https://ethereum.stackexchange.com/questions/3092/how-to-encrypt-a-message-with-the-public-key-of-an-ethereum-address  
  - https://github.com/pubkey/eth-crypto
  - https://ethereum.stackexchange.com/questions/112937/public-private-key-encryption-decryption-with-wallet?rq=1
  - https://ethereum.stackexchange.com/questions/2953/does-ethereum-offer-encrypted-peer-to-peer-communication-applications?noredirect=1&lq=1
  - https://ethereum.stackexchange.com/questions/74739/how-can-i-encrypt-a-file-using-an-ethereum-public-address-and-decrypt-it-with-th?rq=1

#### 2.5.3 压缩
- https://stackoverflow.com/questions/53310514/is-there-a-way-to-compress-a-long-string-to-a-smaller-one-and-vise-versa-by-code?noredirect=1&lq=1
- https://www.npmjs.com/package/js-string-compression


### 2.6 Meeting Rooms
#### 2.6.1 会议室的功能需求
会议室的名字、描述、所有者（可以是多个）和成员管理
- 内容
  - 名字
  - 图标
  - 描述
  - 会议公告
  - 事件
  - 记录
- 管理权限  
  - 创建人
  - 添加合伙人（所有者）
  - 转让
  - 注销
  - 创建
- 会员权限  
  - 加入
  - 退出
  - 黑名单
- 其他  
  - 会议记录
  - 录音
- To Be Done:
- - BAppChain上的智能合约
- - 钱包签字授权登录
- REF
  - Community NFT (2000) and Personal NFT (150) 
    - https://www.linkkey.io/whitepaper
#### 2.6.2 会议室的类型
基于资产的类型：提供以下两大类的房间（可以再根据资产分等级），创建这类房间的条件是必需有该类资产，对于级别更多的房间要求更多的资产拥有量
- 币
- NFT
- 显示用户当前拥有的币和NFT

#### 2.6.3 会议室的创建、管理以及参会资格和奖励
- token gated
  - On-chain conditions and credentials are things like:
    - User is a member of a DAO
    - User holds an NFT in a collection
    - User holds at least 0.1 ETH
    - The result of any smart contract function call
    - User owns a specific wallet address
    - Using boolean operations (AND + OR) for any of the above
  - Threshold Cryptography
  - decentralized access control
    - Encryption: store permissions(aka encrypted) resources on public network that can only be decrypted based on selected on-chain conditions.
    - JWT(aka network signature): use web3 credential to provision access resource on a server.
  -  preferred storage solution including Ceramic, Tableland, IPFS/Filecoin, Arweave, Sia, Storj, or centralized storage
  - https://blog.litprotocol.com/?p=what-is-decentralized-access-control
  - https://developer.litprotocol.com/docs/howItWorks
    - Static Content -Encrypting/locking
      - https://developer.litprotocol.com/docs/SDK/staticContent
    - Dynamic Content - Authorizing access to a resource via JWT
      - https://developer.litprotocol.com/docs/SDK/dynamicContent 
  - unlock
    - https://unlock-protocol.com/#get-started
    - https://docs.unlock-protocol.com/unlock/
    - https://docs.unlock-protocol.com/unlock/developers/tutorials/building-token-gated-applications
  - Orca protocol
    - https://docs.orcaprotocol.org/orca/getting-started-with-pods/creating-a-pod
  - Explore the Defi Universe
    - https://app.shapeshift.com/#/connect-wallet?returnUrl=/dashboard
  - SBT
    - https://github.com/DanieleSalatti/SoulBoundNFT
- Use Social Graph for users to create and manage Rooms
  - Refs
    - https://medium.com/1kxnetwork/organization-legos-the-state-of-dao-tooling-866b6879e93e
    - https://coopahtroopa.mirror.xyz/_EDyn4cs9tDoOxNGZLfKL7JjLo5rGkkEfRa_a-6VEWw
    - https://linda.mirror.xyz/Vh8K4leCGEO06_qSGx-vS5lvgUqhqkCz9ut81WwCP2o
  - Lens Protocol
    - https://docs.lens.dev/docs/primer
    - https://lenster.xyz/
  - Galaxy
    - https://mirror.xyz/gsandly.eth/-_Ur2mcIefC-up3ywVlIOOHoBQUBh4ipOrGtaVWzI5U
- Support Social Token
  - Community Tokens (FWB, Bankless, Apecoin)
  - Brand Tokens (socialstack) 
  - Creator Tokens($ALLIE,$RAC,$SPTM)
  - Personal Tokens($ALEX,$JULIEN,$MACEDO) 
  - https://www.defidaonews.com/article/6725274
  - https://www.youtube.com/watch?v=GsHN7M-mxqw
- Social Events
  - https://app.rabbithole.gg/skills/intro-to-daos  
- snapshot
  - https://docs.snapshot.org/graphql-api  
  - https://docs.snapshot.org/spaces/what-is-a-space
  - https://snapshot.org/#/ens.eth/about
- DAO
  - https://www.tally.xyz/  
  - https://docs.tally.xyz/user-guides-1/supported-dao-frameworks
  - https://www.tally.xyz/governance/eip155:1:0xc0Da02939E1441F497fd74F78cE7Decb17B66529/proposal/106
- Governance
  - https://compound.finance/docs/governance
  - https://docs.openzeppelin.com/contracts/4.x/api/governance
  
#### 2.6.4 参会记录
- POAP
  - https://medium.com/poap/poap-inc-raises-10m-to-accelerate-human-development-a2e36783258d
  - https://intercom.help/poap/en/articles/5855319-the-poap-glossary
  - https://poap.xyz/
  - https://www.chaincatcher.com/article/2067098
  - jeevan@poap.io / reed@poap.io
  - https://documentation.poap.tech/
  - api-key: 427H0cApPofXsORN1w2iOBAPs5EVykJlF4iDiEECwN4xptx4t0DQv5UMaFfR5vyAZh3LT7aseLygjSXoqJ10BYEkWjDkW3jvSQzAClmq9EncUeAbLGqhewsvCfsAWMcL
  -  curl -vvv -H "X-API-Key: 427H0cApPofXsORN1w2iOBAPs5EVykJlF4iDiEECwN4xptx4t0DQv5UMaFfR5vyAZh3LT7aseLygjSXoqJ10BYEkWjDkW3jvSQzAClmq9EncUeAbLGqhewsvCfsAWMcL"  https://api.poap.tech/paginated-events?limit=100&offset=0&sort_dir=asc&sort_field=name
## 3. App前端开发
### 3.1. metamask support on Web
- login in by sign with metamask (maybe other ethereum main or test chain, 
but it will connnent to our own whisper blockchain and we could give him some EHT of our own private chain)
### 3.2 walletConnect on mobile to bind address and update blockchain data
- Web, Check the instructions for DAPP
  - https://docs.walletconnect.com/quick-start/dapps/client
- Web3 on IOS
  - https://github.com/Boilertalk/Web3.swift  
- Wallet Connect on IOS and Android
  - https://github.com/WalletConnect/WalletConnectSwift-Example/tree/main/ExampleApps
  - https://docs.walletconnect.com/quick-start/wallets/swift
- Using Web3 and WalletConnect together to execute smart contract
  - initial contract from web3 
  - prepare transaction data by calling function in contract   
  - invote walletconnect to sign and excute the transaction 
  - https://www.argent.xyz/blog/building-ethereum-dapps-on-ios-with-web3-swift/
  - https://medium.com/mercuryprotocol/introducing-web3-swift-for-ethereum-ios-development-1e02212b662b
### 3.3 ENS query
- use subgraph to query name
  - https://medium.com/coinmonks/how-to-convert-ens-address-to-eth-address-in-js-251c6209c208
  - https://github.com/Shmoji/ens-example
  - https://thegraph.com/hosted-service/subgraph/ensdomains/ens
```
domains(first: 1, where:{name:"beagles.eth"}) {
    id
    name
    labelName
    labelhash
    owner{id
    domains{id}}
  }
```  
  -- javascript
```  
import { gql } from 'graphql-request'

export default function getQueryENSForETHAddress(ensAddress: string) {
  return gql`
    {
      domains(first: 1, where:{name:"${ensAddress.toLowerCase()}"}) {
        name
        labelName
        owner {
          id
          domains {
            id
          }
        }
      }
    }`
}

const HTTP_GRAPHQL_ENDPOINT =
  'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

/*
 * @param ensAddress - the ENS address. Example: vitalik.eth
 * @return the Ethereum address or 0 string if invalid
 */
export async function queryENSForETHAddress(ensAddress: string): Promise<string> {
  if (!ensAddress || !ensAddress.toLowerCase().includes('.eth')) {
    return '0'
  }
  const result = await request(HTTP_GRAPHQL_ENDPOINT, getQueryENSForETHAddress(ensAddress))
  return result.domains && result.domains.length > 0
    ? result.domains[0].owner.id
    : '0'
}

```  
  
### 3.4 UI
- ENS name support
- Add a row to add or edit name, name can keep in a new smart contract which can search by address
- this name should be treated as the name of profile
- should have a ICON too
- Public Chat Room - click the name icon and enter the chat dialog window to receive whisper messages

## 4. smart contract开发
- ENS 合约部署：
  - 相关术语
    - https://docs.ens.domains/terminology
  - 使用
  - 部署合约
    - https://docs.ens.domains/deploying-ens-on-a-private-chain
- 顶级域名
  - .fax
  - .eth 
  - 每个域名需要Deploy a Registrar
    - So far, domains can only be registered manually by the owner of the registry's root node. Fortunately, contracts can also own nodes. This means we can set up a registrar contract as the owner of a node, e.g. "test", in the registry which enables it to distribute subdomains such as "mycontract.test". It allows us to have custom, on-chain logic which governs domain allocation. Once we own a (sub-)node we are free to repeat this process and set up another registrar. If you are part of the "myorg" organisation you could register "myorg.test" and let it point to your custom registrar which only allows certified members of your organisation to claim subdomains such as "bob.myorg.test". 
```
const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash("test"));
  await registrar.deployed();
  await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", sha3("test"), registrar.address);
})
```
- Deploy the Reverse Registrar
    - Similarly, if you wish to enable reverse resolution on your deployment, you will need to deploy the reverse registrar:
```
    const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
    await reverseRegistrar.deployed();
    setupReverseRegistrar(ens, resolver, reverseRegistrar, accounts);
   
    
    async function setupReverseRegistrar(ens, resolver, reverseRegistrar, accounts) {
      await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", utils.sha3("reverse"), accounts[0]);
      await ens.setSubnodeOwner(namehash.hash("reverse"), utils.sha3("addr"), reverseRegistrar.address);
    }
```   
- register content: 
  - simple ens by deploy a contract to register the following infromation in ENS: eth address, whisper related information(how to get): id, public and private key
- contacts:
- meeting room

## 5. EthereumAPI开发
### 5.1 ENS register
- ENS name end with .beagles.eth
- current .fax
- option: register and publish name (using ENS api)
## 5.2 login/listen whisper message
- public message
## 5.3 call/answer
- should be able to call other beagle user or metamask 
#  5.4 Profile
- create/update

## 6. 术语
###唯一标识
ens名字和以太坊地址都可以作为唯一地址
- address: ethereum address, 以太坊钱包地址
- ens: 以太坊域名，连续的字符串，xxx.eth
  - ens subdomain: xxx.beagles.eth，没有ens名字的可以免费获取beagles.eth二级域名
### 有关ens域名的概念和术语
- tld：top level domain name, 顶级域名，除了.eth, 我们还将在bnb和esc上提供.bnb和.ela等tld名称的集成  
- subdomain: 子域名
### Profile 的链上保存
属性保存在ens名字的ens合约，没有ens名字保存在shhData合约中，将来可以免费申请并保存在beales.eth子域名中，现阶段先放在shhData合约下
- nick name: 中间可以有空格，如alan chung
- 与消息通信相关的，可视为内部属性，App重装后需要重新发布到链上：
  - carrier address: carrier id, 可以以此添加好友
  - whisper public key: 
- avatar: 头像的content hash值
- 用户可以一次或者多次用更新profile
### App本地好友数据 
- 好友的ens名字或者address
- 好友的Profile，可以重新获取好友的profile 
