pragma solidity ^0.4.21;

import "../WhitelistedCrowdsale.sol";
import "../token/ERC20/MintableToken.sol";
import "../Crowdsale.sol";

contract WhiteListMock is WhitelistedCrowdsale {
    function WhiteListMock()
        Crowdsale(1, address(1), MintableToken(1))
        public
    {}

}
