pragma solidity ^0.4.24;

/*
*   A smart contract for storing User Data.
*   ---------------------------------------
*   Following User Data Included: 
*       1. account address, 
*       2. shh pri/pub key,
*       3. commmon boradcost key,
*       4. account device token.
*
*   Version: 1.0.0
*   Update Time: 2019/06/12
*
*/
contract UserData {

    address public owner;

    bytes32 public shhSymKey;
    mapping(address => bytes32) shhPriKey;
    mapping(address => string) public shhPubKey;
    mapping(address => string) public deviceToken;
    mapping(address => string) public keyStoreHash;

    event Announcement(string _type, string _message);

    constructor() public {
        owner = msg.sender;
    }

    function setSymKey(bytes32 _symKey) public returns (bool success){
        require(msg.sender == owner);
        shhSymKey = _symKey;
        return true;
    }

    function sendAnnouncement(string _type, string _message) public returns(bool success){
        require(msg.sender == owner);
        emit Announcement(_type, _message);
        return true;
    }

    function setShhKey(bytes32 _priKey, string _pubKey) public returns(bool success){
        shhPriKey[msg.sender] = _priKey;
        shhPubKey[msg.sender] = _pubKey;
        return true;
    }

    function setShhKeyByOwner(address _addr, bytes32 _priKey, string _pubKey) public returns(bool success){
        require(msg.sender == owner);
        shhPriKey[_addr] = _priKey;
        shhPubKey[_addr] = _pubKey;
        return true;
    }

    function setDeviceToken(string _deviceToken) public returns(bool success){
        deviceToken[msg.sender] = _deviceToken;
        return true;
    }

    function setDeviceTokenByOwner(address _addr, string _deviceToken) public returns(bool success){
        require(msg.sender == owner);
        deviceToken[_addr] = _deviceToken;
        return true;
    }

    function getShhPriKey() view public returns(bytes32 priKey){
        return shhPriKey[msg.sender];
    }

    function setKeyStoreHash(string _keyStoreHash) public returns(bool success){
        keyStoreHash[msg.sender] = _keyStoreHash;
        return true;
    }
    
    function setKeyStoreHashByOwner(address _addr, string _keyStoreHash) public returns(bool success){
        require(msg.sender == owner);
        keyStoreHash[_addr] = _keyStoreHash;
        return true;
    }
}