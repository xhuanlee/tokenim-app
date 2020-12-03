pragma solidity ^0.4.24;

contract ApiConfig{
    address public owner;
    
    address public ethereum_account;
    string public ethereum_account_prikey;
    uint256 public ethereum_number;
    
    address public ens_fax_domain_owner;
    string public ens_fax_domain_prikey;
    
    address public user_data_owner;
    string public user_data_prikey;
    
    function ApiConfig(
        address _ether_account,
        string _ether_prikey, 
        uint256 _ether_number, 
        address _ens_fax_owner,
        string _ens_fax_prikey,
        address _user_data_owner,
        string _user_data_prikey
    ) public {
        owner = msg.sender;
        
        ethereum_account = _ether_account;
        ethereum_account_prikey = _ether_prikey;
        ethereum_number = _ether_number;
        
        ens_fax_domain_owner = _ens_fax_owner;
        ens_fax_domain_prikey = _ens_fax_prikey;
        
        user_data_owner = _user_data_owner;
        user_data_prikey = _user_data_prikey;
    }
    
    function setEtherAccount(address _ether_account, string _ether_prikey, uint256 _ether_number) public returns(bool success){
        require(msg.sender == owner);
        ethereum_account = _ether_account;
        ethereum_account_prikey = _ether_prikey;
        ethereum_number = _ether_number;
        
        return true;
    }
    
    function setEnsFaxDomainAccount(address _ens_fax_owner, string _ens_fax_prikey) public returns(bool success){
        require(msg.sender == owner);
        ens_fax_domain_owner = _ens_fax_owner;
        ens_fax_domain_prikey = _ens_fax_prikey;
        
        return true;
    }
    
    function setUserDataAccount(address _user_data_owner, string _user_data_prikey) public returns(bool success){
        require(msg.sender == owner);
        user_data_owner = _user_data_owner;
        user_data_prikey = _user_data_prikey;
        
        return true;
    }
}
