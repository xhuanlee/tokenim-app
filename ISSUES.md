# ISSUES

## 合约执行一直处于 pending 状态

**原因：**从第一个`pending`状态开始得后面所有`transaction`都会一直pending，取决于`nonce`
**解决：**设置和`pending`状态的交易相同的`nonce`让后面的交易覆盖之前的交易，设置`nonce`时采用第一种方式。
```js
// 以下实在 geth 控制台执行的命令
txpool // 查询交易状态(pending, queue)
// 获取下一个transaction nonce
eth.getTransactionCount('0xd227af0e36ae44e673b0143d7765dc4da9b64b68');
// 获取下一个pending transaction nonce
eth.getTransactionCount('0xd227af0e36ae44e673b0143d7765dc4da9b64b68', 'pending');
```
