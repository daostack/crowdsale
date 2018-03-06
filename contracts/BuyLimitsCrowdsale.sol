pragma solidity 0.4.19;

import "./ownership/Ownable.sol";
import "./Crowdsale.sol";


contract BuyLimitsCrowdsale is Crowdsale {
    event LogLimitsChanged(uint _minBuy, uint _maxBuy);

    // Variables holding the min and max payment in wei
    uint public minBuy; // min buy in wei
    uint public maxBuy; // max buy in wei, 0 means no maximum

    /*
    ** Modifier, reverting if not within limits.
    */
    modifier isWithinLimits(uint _amount) {
        require(withinLimits(_amount));
        _;
    }

    /*
    ** @dev Constructor, define variable:
    */
    function BuyLimitsCrowdsale(uint _min, uint  _max) public {
        _setLimits(_min, _max);
    }

    /*
    ** @dev Check TXs value is within limits:
    */
    function withinLimits(uint _value) public view returns(bool) {
        if (maxBuy != 0) {
            return (_value >= minBuy && _value <= maxBuy);
        }
        return (_value >= minBuy);
    }

    /*
    ** @dev set limits logic:
    ** @param _min set the minimum buy in wei
    ** @param _max set the maximum buy in wei, 0 indeicates no maximum
    */
    function _setLimits(uint _min, uint _max) private {
        if (_max != 0) {
            require (_min <= _max); // Sanity Check
        }
        minBuy = _min;
        maxBuy = _max;
        LogLimitsChanged(_min, _max);
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
