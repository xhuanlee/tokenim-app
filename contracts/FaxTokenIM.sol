pragma solidity ^0.4.24;

/*
*   A smart contract for Fax Token Instant Message.
*   ----------------------------------------------
*   This contract is used for:
*   1. New registed user will reward 20 Fax Token.
*   2. User will get 5 Fax Token per day via login.
*   3. It will cost 1 Fax Token per message. 
*   
*
*   Version: 1.0.0
*   Update Time: 2019/04/22
*
*/
import  './FaxToken.sol';

contract FaxTokenIM {
    address public admin;
    
    FaxToken public tokenContract;
    address public tokenAdmin;

    mapping (address=>string) public shhPubKey;
    
    function setPubKey(string _pubkey){
        shhPubKey[msg.sender] = _pubkey;
    }
        
    function FaxTokenIM(FaxToken _tokenContract, address _tokenAdmin) public payable {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenAdmin = _tokenAdmin;
    }
    
    function TransferOutToken(){
        require(msg.sender == admin);
        tokenContract.transfer(tokenAdmin, tokenContract.balanceOf(msg.sender));
    }

    uint256 public rewards = 0; 
    uint256 public messageCount = 0;
    uint256  registedRewardToken = 20;
    uint256  loginRewardToken = 5;
    uint256  messageRequireToken = 1;
    
    mapping (address => uint256) public registedReward;
    mapping (uint => mapping(address => uint256)) public loginReward;
    
    struct Message{
        uint _time;
        uint256 _messageBody;
    }
    
    mapping (address => mapping(address => Message)) public MessageList;

    event RegistedReward(
        address indexed _account,
        uint256 _value
    );
    event LoginReward(
        address indexed _account,
        uint256 _value
    );
    event MessageSendSuccess(
        address indexed _from,
        address indexed _to
    );

        
    function getRegistedReward() public payable{
        require(registedReward[msg.sender] == 0);
        require(tokenContract.allowance(tokenAdmin,this) >= registedRewardToken);
        tokenContract.transferFrom(tokenAdmin,msg.sender, registedRewardToken);
        registedReward[msg.sender] += registedRewardToken;
        rewards += registedRewardToken;

        RegistedReward(msg.sender, registedRewardToken);
    }
    
    function getLoginReward() public payable{
        require(loginReward[now/86400][msg.sender] == 0);
        require(tokenContract.allowance(tokenAdmin,this) >= loginRewardToken);
        tokenContract.transferFrom(tokenAdmin,msg.sender, loginRewardToken);
        loginReward[now/86400][msg.sender] += loginRewardToken;
        rewards += loginRewardToken;
        
        LoginReward(msg.sender, loginRewardToken);
        
    }
    
    function sendMessage(address to, uint256 messageBody) public payable{
        require(msg.sender != to);
        require(tokenContract.balanceOf(msg.sender) >= messageRequireToken);
        require(tokenContract.allowance(msg.sender,this)>= messageRequireToken);
        
        tokenContract.transferFrom(msg.sender, this, messageRequireToken);
        MessageList[msg.sender][to] = Message({_time:now, _messageBody: messageBody});
        messageCount += 1;

        MessageSendSuccess(msg.sender, to);
    }

}