## 合约部署

通过[remix](http://remix.ethereum.org/)部署，之前用 `truffle` 部署之后好像有问题，不能执行`invest`操作，感觉是部署时候的参数设置不对。  
truffle 发布合约时需要指定发布合约，可以参看目录下的`2_tronex_migration.js`文件。

## 合约地址

SAFEMATH: 0x7c157C13Fdcc40d38b342D24F16004Ec34f71c95(remix 发布)
TRONEX: 0x33915024E26917d0Ee22aDAC978BA329D455d83f(remix 发布)
TRONEX: 0x4760061cF091d84a366b0E1558De6Ab44dA74803(truffle 发布的)

## 合约执行问题

发现执行时 gas 并不是越高越好，高了反而可能执行不了。需要通过 estimateGas 查询当前合适的 gas 数量，再执行 invest 时设置参数为  
{ gasPrice: 20, gas: ${estimateGas返回值} } 时可以执行成功。
```
# 预估 gas 
eth.estimateGas({ to: "0x33915024E26917d0Ee22aDAC978BA329D455d83f", from: "0x2b1681acc355771f7b6ca9b4f3cc479688c96691", value: "0x1bc16d674ec80000", data: "0x03f9c7930000000000000000000000003006e00d499f821d8f164af63191bd6fdee51af1" })
```
