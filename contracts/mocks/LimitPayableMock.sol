pragma solidity 0.4.19;

import "../LimitPayable.sol";
import "../token/ERC20/MintableToken.sol";
import "../Crowdsale.sol";

contract LimitPayableMock is LimitPayable {
    function LimitPayableMock(uint _minPay, uint _maxPay) public
        LimitPayable(_minPay, _maxPay)
        Crowdsale(1, address(1), MintableToken(1))
    {}

    function testBuy() payable isWithinLimits(msg.value) public {
    }

}
