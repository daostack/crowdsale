pragma solidity ^0.4.21;

import "./Crowdsale.sol";
import "./BuyLimits.sol";


contract BuyLimitsCrowdsale is BuyLimits,Crowdsale {

    /**
     ** @dev Constructor, define variable:
    */
    function BuyLimitsCrowdsale(uint _min, uint  _max)
    public
    BuyLimits(_min,_max)
    {
    }

    /**
     * @dev Extend parent behavior requiring to be within contributing period
     * @param _beneficiary Token purchaser
     * @param _weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal isWithinLimits(_weiAmount) {
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }
}
