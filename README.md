## FaxToken-IM
### 0. 开发环境
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm -v
nvm use 18
```
### 1. 安装项目
克隆代码到本地并安装包依赖
```shell script
git clone http://192.168.0.91/liwang/FaxToken-IM.git
cd FaxToken-IM
npm install --legacy-peer-deps
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

### 2. 安装Truffle
使用全局安装truffle包
```shell script
npm install truffle -g
```
查看truffle版本
```shell script
# *nix环境下
truffle version
# windows环境下，会优先搜索当前目录下的truffle.js，需指定truffle.cmd后缀
truffle.cmd version
```

### 3. 配置Truffle
在 `config.js`中配置以太坊节点
```js
module.exports = {
  networks: {
    development: {
      host: 'localhost', // 节点地址
      port: 7545,        // rpc端口
      gas: 4700000,
      network_id: '*',
    },
  }
}
```
测试节点连通性，并进入truffle 控制台
```shell script
truffle console
# or truffle.cmd console
```

### 4. 配置账户&部署合约
在`config.js`中配置合约的管理员账户（合约创建者账户，token默认所有者）
```js
module.exports = {
  admin: {
    token_admin: '0xe315C801Bc55c682E38399c5e1bC49c6E2E5f1dF',
    im_admin: '0xe315C801Bc55c682E38399c5e1bC49c6E2E5f1dF',
    sale_admin: '0xe315C801Bc55c682E38399c5e1bC49c6E2E5f1dF',
  }
}
```
部署合约前，先解锁对应的管理员账户
```js
//进入truffle console，或者直接进入以太坊节点的Geth JavaScript console
web3.personal.unlockAccount('address','password') //解锁账户
```
部署合约
```shell script
# 初始化(初始化之后需要修改 truffle-config.js 相关内容[rpc地址，发布人地址等等])
truffle init
# 编译
truffle compile
# 发布
truffle deploy //重新部署 truffle deploy --reset
```
合约部署成功后，返回合约地址
```
Using network 'development'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0x50cda0a345b35513a46134aecfcb1be86064417cbf57a37b0b244fecac949aae
  Migrations: 0x4f5cd6e99ac8f182e88654a3ecbe492bccf43dc0
Saving successful migration to network...
  ... 0x2d3b90eb4f2065dcfab5772b415a3836015395c6436328942b85df4a82df4841
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Replacing FaxToken...
  ... 0x582f3097531830673c9f5720ec0ceb2986987dd9cc215e4572e60a10fe772eee
  FaxToken: 0x40d6364530cecc161e0f50c6a4b2050c75218a45                    ←--FaxToken Address
  Replacing FaxTokenIM...
  ... 0x060fd666f7bc49841a70e6fe634c37e308ee23da3d4d02e489d99de7e6c255fd
  FaxTokenIM: 0xe9b1f4a73db86d53363a829ff9c6500ee4a04c05                  ←--FaxTokenIM Address
Saving successful migration to network...
  ... 0xba6f234ad08fbee5c4e970deebda960fffc53931a0fcaf39e5aa212113393a88
Saving artifacts...
```
在`build\contracts\FaxToken.json`， `build\contracts\FaxTokenIM.json`中也可以找到对应网络的部署地址
```
  // build\contracts\FaxToken.json
  "networks": {
    "5777": {
      "events": {},
      "links": {},
      "address": "0x40d6364530cecc161e0f50c6a4b2050c75218a45",
      "transactionHash": "0x582f3097531830673c9f5720ec0ceb2986987dd9cc215e4572e60a10fe772eee"
    }
  },
 
  // build\contracts\FaxTokenIM.json
  "networks": {
    "5777": {
      "events": {},
      "links": {},
      "address": "0xe9b1f4a73db86d53363a829ff9c6500ee4a04c05",
      "transactionHash": "0x060fd666f7bc49841a70e6fe634c37e308ee23da3d4d02e489d99de7e6c255fd"
    }
  },
```

### 5. 启动 web 服务器
合约部署完成后，即可启动Web服务器
```shell script
yarn start
```

### 6. 打包发布

#### a) 打包
```shell script
yarn build
```
#### b) 将dist目录下的文件发布到服务器

#### c) gzip 压缩
```shell script
gzip -9k *.js *.css
```
