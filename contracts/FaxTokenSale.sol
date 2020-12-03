pragma solidity ^0.4.24;

/*
*   A smart contract for sale Fax Token with Ether.
*
*   Version: 1.0.0
*   Update Time: 2019/05/06
*
*/
import  './FaxToken.sol';

contract FaxTokenSale {
    address public admin;

    FaxToken public tokenContract;
    address public tokenAdmin;

    // 1 Ether = 1000 FAX
    uint256 public tokenPrice = 1000000000000000;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    function FaxTokenSale(FaxToken _tokenContract, address _tokenAdmin) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenAdmin = _tokenAdmin;

    }

    function TransferOutEther() public {
        require(msg.sender == admin);
        admin.transfer(address(this).balance);
    }

    function setPrice(uint256 _newPrice){
        require(msg.sender==admin);
        tokenPrice = _newPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == (_numberOfTokens * tokenPrice));
        require(tokenContract.allowance(tokenAdmin,this) >= _numberOfTokens);
        tokenContract.transferFrom(tokenAdmin,msg.sender, _numberOfTokens);

        tokensSold += _numberOfTokens;

        Sell(msg.sender, _numberOfTokens);
    }


}