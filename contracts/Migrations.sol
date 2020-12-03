pragma solidity ^0.4.17;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    if (msg.sender == owner) _;
  }

/*  function Migrations() public {
    owner = msg.sender;
  }
*/
	constructor() public {
    owner = msg.sender;
	}

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
  mapping (bytes32 => address) records;

  bytes32[] public userList;
    function setAddr(bytes32 node, address addr) public  {
        records[node] = addr;
        userList.push(node);
//        AddrChanged(node, addr);
    }

    /**
     * Returns the address associated with an ENS node.
     * @param node The ENS node to query.
     * @return The associated address.
     */
    function getAddr(bytes32 node) public view returns (address) {
        return records[node];
    }
    function getUsers()  public view returns (bytes32[]){
        return userList;
    }
}
