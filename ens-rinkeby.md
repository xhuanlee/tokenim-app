1. 运行full node
```
../geth-alltools-linux-amd64-1.10.16-20356e57/geth --rinkeby --port 30308 --http.port 8508 --ws --ws.port 8548 --ws.api web3,net,eth --http --http.addr 0.0.0.0 --http.api personal,ens,net,eth,web3,db,txpool,miner --syncmode snap --cache 4096 --datadir node --http.rpcprefix / --http.corsdomain * --http.vhosts * console
```
2. 部署合约
```
Deployed contracts
===================================================
ensAddress 0x98325eDBE53119bB4A5ab7Aa35AA4621f49641E6
oldEnsAddress 0x0226AeB1d1F6906DC93b6D50c30f128745c0B7Ee
legacyAuctionRegistrarAddress 0xFc7765cBfd99E761c41ce571CcD214Fe03Dfd11a
baseRegistrarAddress 0xD5F56224D444236eC1BA56a4D0837f809316810f
controllerAddress 0x4E3b6eC7f942eA57009D7164B706D78f141e658b
oldResolverAddresses [
  '0x1E785820B8Df9d2658358849Ed679c2ff820B67A',
  '0x554bdF27B17826Ea93f69d8865ce8a5b21232981'
]
oldControllerAddress 0x14AbA8Cc1aC807d1ac82cb9472AcEB70b7307681
上面那些给ens-app用应该就够了。

实际上还有下面这些：
bulkRenewalAddress 0xF0350ed17071E89bA485442e9dC50E5349888830
oldContentResolverAddresses [ '0x554bdF27B17826Ea93f69d8865ce8a5b21232981' ]
oldBaseRegistrarAddress 0x7eF86F9bd92DB658887cB0C52561F93f48e2a005
reverseRegistrarAddress 0xFdb1b60AdFCba28f28579D709a096339F5bEb651
registrarMigration 0x27B0D71c226690a608f825b1fF40c91F4238e4D7
resolverAddress 0xAe41CFDE7ABfaaA2549C07b2363458154355bAbD
reverseRegistrarOwnerAddress 0xf86520e8559ff8807ecfa5674f69f3725c25AA34
exponentialPremiumPriceOracle 0x5C61772BAFCA7A04151dE3254DC5CED953326a67
dummyOracle 0x56481a404162b9a930e8274a097d9b0EcA5723A9
---------------------------------------------------
subdomainRegistrar:
0xEE29d4293A2a701478fB930DEe29d56b8F53B115
0x86cc7772389e54C5cbB29F335554d7839098F921
0x32C5CB96868c57F3192f5F77942eD1700A4f45b1
0x6B309979818b75d3D7c19E20343440932C489D24
```
