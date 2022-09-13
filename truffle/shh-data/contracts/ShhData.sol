pragma solidity ^0.4.24;

contract ShhData {

  address public owner;
  address public admin;
  mapping(address => string) shhKeyIdMap;
  mapping(address => bytes32) shhPriKeyMap;
  mapping(address => string) public shhPubKeyMap;
  mapping(address => string) public shhNameMap;
  mapping(address => string) public shhENSMap;
  mapping(address => string) public shhCarrierMap;

  constructor() public {
    owner = msg.sender;
  }

  function saveShhKey(string shhKeyId, bytes32 shhPriKey, string shhPubKey) public returns (bool success) {
    shhKeyIdMap[msg.sender] = shhKeyId;
    shhPriKeyMap[msg.sender] = shhPriKey;
    shhPubKeyMap[msg.sender] = shhPubKey;
    return true;
  }

  function saveShhKeyId(string shhKeyId) public returns (bool success) {
    shhKeyIdMap[msg.sender] = shhKeyId;
    return true;
  }

  function getENSName() public view returns(string keyId) {
    return shhENSMap[msg.sender];
  }

  function publishENS(string ensname) public returns (bool success) {
    shhENSMap[msg.sender] = ensname;
    return true;
  }

  function publishENSAddress(string ensname, address addres) public returns (bool success) {
    require(msg.sender == owner || msg.sender==admin);
    shhENSMap[addres] = ensname;
    return true;
  }

  function getCarrierID() public view returns(string keyId) {
    return shhCarrierMap[msg.sender];
  }

  function publishCarrier(string ensname) public returns (bool success) {
    shhCarrierMap[msg.sender] = ensname;
    return true;
  }

  function publishCarrierAddress(string ensname, address addres) public returns (bool success) {
    require(msg.sender == owner || msg.sender==admin);
    shhCarrierMap[addres] = ensname;
    return true;
  }

  function setAdmin(address _admin) public returns (bool success) {
    require(owner == msg.sender);
    admin = _admin;
    return true;
  }

  function saveShhKeyPriKey(bytes32 shhPriKey) public returns (bool success) {
    shhPriKeyMap[msg.sender] = shhPriKey;
    return true;
  }

  function saveShhPubKey(string shhPubKey) public returns (bool success) {
    shhPubKeyMap[msg.sender] = shhPubKey;
    return true;
  }

  function saveShhName(string shhName) public returns (bool success) {
    shhNameMap[msg.sender] = shhName;
    return true;
  }

  function getShhKeyId() public view returns(string keyId) {
    return shhKeyIdMap[msg.sender];
  }

  function getShhPriKey() public view returns(bytes32 priKey) {
    return shhPriKeyMap[msg.sender];
  }

  function getShhPubKey() public view returns(string pubKey) {
    return shhPubKeyMap[msg.sender];
  }

  function getPublicShhPubKey(address adr) public view returns(string pubKey) {
    return shhPubKeyMap[adr];
  }

  function getPublicShhName(address adr) public view returns(string shhName) {
    return shhNameMap[adr];
  }
}
