pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/ownership/Ownable.sol";


contract LimitPayable is Ownable {
    event LogLimitChanged(uint _minPay, uint _maxPay);

    // Variables holding the min and max payment in wei
    uint public minPay;
    uint public maxPay;

    /*
    ** Modifier, reverting if not within limits.
    */
    modifier isWithinLimits() {
        require(withinLimits());
        _;
    }

    /*
    ** @dev Construcor, define variable:
    */
    function LimitPayable(uint _min, uint  _max) public {
        _setLimits(_min, _max);
    }

    /*
    ** @dev owner can change min and max:
    */
    function changeLimits(uint _min, uint _max) public onlyOwner {
        _setLimits(_min, _max);
    }

    /*
    ** @dev Check TXs value is within limits:
    */
    function withinLimits() public view returns(bool) {
        return (msg.value >= minPay && msg.value <= maxPay);
    }

    /*
    ** @dev set limits logic:
    */
    function _setLimits(uint _min, uint _max) private {
        require (_min<=_max); // Sanity Check
        minPay = _min;
        maxPay = _max;
        LogLimitChanged(_min, _max);
    }
}
