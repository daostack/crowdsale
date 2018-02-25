pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";


contract WhiteList is Ownable {
    event LogWhiteListAdd(address indexed _address);
    event LogWhiteListRemove(address indexed _address);

    uint public whiteListSize;

    mapping (address=>bool) public whiteList;

    modifier isWhiteListed() {
        require(whiteListed(msg.sender));
        _;
    }

    function whiteListed(address _address) public view returns(bool) {
        return whiteList[_address];
    }

    function addToWhiteList(address _address) onlyOwner public returns(bool) {
        if (!whiteList[_address]) {
            whiteListSize++;
            whiteList[_address] = true;
            LogWhiteListAdd(_address);
            return true;
        }
        return false;
    }

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
