pragma solidity 0.4.19;

import "./ownership/Ownable.sol";
import "./Crowdsale.sol";


contract LimitPayable is Crowdsale,Ownable {
    event LogLimitsChanged(uint _minPay, uint _maxPay);

    // Variables holding the min and max payment in wei
    uint public minPay;
    uint public maxPay;

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
    function withinLimits(uint _value) public view returns(bool) {
        return (_value >= minPay && _value <= maxPay);
    }

    /*
    ** @dev set limits logic:
    */
    function _setLimits(uint _min, uint _max) private {
        require (_min<=_max); // Sanity Check
        minPay = _min;
        maxPay = _max;
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
