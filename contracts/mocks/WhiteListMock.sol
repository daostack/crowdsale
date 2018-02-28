pragma solidity 0.4.19;

import "../zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "../zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";

contract WhiteListMock is WhitelistedCrowdsale {
    function WhiteListMock()
        Crowdsale(1, address(1), MintableToken(1))
        public
    {}

}
