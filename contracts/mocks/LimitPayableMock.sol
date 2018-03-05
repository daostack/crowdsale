pragma solidity 0.4.19;

import "../BuyLimitsCrowdsale.sol";
import "../token/ERC20/MintableToken.sol";
import "../Crowdsale.sol";

contract LimitPayableMock is BuyLimitsCrowdsale {
    function LimitPayableMock(uint _minPay, uint _maxPay) public
        BuyLimitsCrowdsale(_minPay, _maxPay)
        Crowdsale(1, address(1), MintableToken(1))
    {}

    function testBuy() payable isWithinLimits(msg.value) public {
    }

}
