pragma solidity 0.4.19;

import "../BuyLimitsCrowdsale.sol";
import "../token/ERC20/MintableToken.sol";
import "../Crowdsale.sol";

contract BuyLimitsCrowdsaleMock is BuyLimitsCrowdsale {
    function BuyLimitsCrowdsaleMock(uint _minBuy, uint _maxBuy, MintableToken _token) public
        Crowdsale(1, msg.sender, _token)
        BuyLimitsCrowdsale(_minBuy, _maxBuy)
    {}
}
