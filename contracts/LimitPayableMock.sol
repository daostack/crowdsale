pragma solidity 0.4.19;

import "./LimitPayable.sol";


contract LimitPayableMock is LimitPayable {
    function LimitPayableMock(uint _minPay, uint _maxPay) LimitPayable(_minPay, _maxPay) public {
    }

    function () payable isWithinLimits public {
    }
}
