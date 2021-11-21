#Decentralized WEB
## 1. 需求
- 降低直到去除对于固定IP和服务器的依赖
- 目前网站和App都还依赖特定的域名和IP
- 不同于现在BS架构的网页，服务节点分布在不同的地方，数据存放在链上，本地数据可以方便的从链上重构，节点的安装一般不需要本地化的配置
- 需要构建一个可以在浏览器里通过websock访问的P2P网络（DHT）
- 前端应用对于网络的使用通过根节点（bootnode）接入后，通过节点的ID（HASH值）访问；

## 2. 解决方案
- bootnode+libp2p
- bootnode的信息记录在ipfs或者智能合约里
- https://blog.keep.network/introduction-to-libp2p-57ce6527babe
- https://github.com/libp2p/js-libp2p/tree/master/examples
- 用js-libp2p搭建一个可以用websocket或者socket.io加入和访问的DHT网络

## 3. bootnode
- 服务器IP和端口记录在公共基础设施上，返回bootnode的列表
- https://www.pinata.cloud/
- https://docs.pinata.cloud/
- bootnode的功能要尽量简单，主要是为了便于用js-libp2p开发的节点（node）和App能够加入和发现
## 4. socket.io
- 现在App对于socket.io的访问是通过指定ip和port, 要用用libp2p的hash代替；
- 需要用js-libp2p实现socket.io服务器，可以进行简单的room会话，即进入和退出房间，发言和接听消息；
- App或者Web客户端通过hash访问socket.io服务器
- https://github.com/libp2p/js-libp2p/tree/master/examples/chat

## 5. push-application
- 现在App对于push-application的访问是通过指定ip和port, 要用用libp2p的hash代替；
- 需要用js-libp2p实现push-application服务器的代理proxy, 提供socket.io接口提交device token注册和离线通知的请求；
- device token和carrier id记录在智能合约或者IPFS中；
- App或者Web客户端通过hash访问上述代理proxy；
