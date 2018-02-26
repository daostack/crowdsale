pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";


contract WhiteList is Ownable {
    event LogWhiteListAdd(address indexed _address);
    event LogWhiteListRemove(address indexed _address);

    uint public whiteListSize;

    mapping (address=>bool) public whiteList;

    modifier isWhiteListed() {
        require(whiteList[msg.sender]);
        _;
    }


    /*
    ** @dev Add an address to the whitelist.
    */
    function addToWhiteList(address _address) onlyOwner public returns(bool) {
        if (!whiteList[_address]) {
            whiteListSize++;
            whiteList[_address] = true;
            LogWhiteListAdd(_address);
            return true;
        }
        return false;
    }

    /*
    ** @dev Remove an address from the whitelist.
    */
    function removeFromWhiteList(address _address) onlyOwner public returns(bool) {
        if (whiteList[_address]) {
            whiteListSize--;
            whiteList[_address] = false;
            LogWhiteListRemove(_address);
            return true;
        }
        return false;
    }
}
