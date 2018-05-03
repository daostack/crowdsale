pragma solidity ^0.4.21;

import "./token/ERC20/MintableToken.sol";
import "./CappedCrowdsale.sol";
import "./TimedCrowdsale.sol";
import "./WhitelistedCrowdsale.sol";
import "./Crowdsale.sol";
import "./FinalizableCrowdsale.sol";
import "./MintedCrowdsale.sol";
import "./BuyLimitsCrowdsale.sol";


contract DAOstackSale is MintedCrowdsale, CappedCrowdsale, FinalizableCrowdsale, BuyLimitsCrowdsale, WhitelistedCrowdsale {
    using SafeMath for uint256;

    uint max_gas_price;

    /*
    ** @dev constructor.
    ** @param _openingTime the time sale start.
    ** @param _closingTime the time sale ends.
    ** @param _rate the sale rate, buyer gets tokens = _rates * msg.value.
    ** @param _wallet the DAOstack multi-sig address.
    ** @param _cap the sale cap.
    ** @param _minBuy the min amount (in Wei) one can buy with.
    ** @param _maxBuy the max amount (in Wei) one can buy with.
    ** @param _token the mintable token contract.
    */
    function DAOstackSale(
        uint _openingTime,
        uint _closingTime,
        uint _rate,
        address _wallet,
        uint _cap,
        uint _minBuy,
        uint _maxBuy,
        MintableToken _token
        uint _max_gas_price;
    ) public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        BuyLimitsCrowdsale(_minBuy, _maxBuy)
        TimedCrowdsale(_openingTime,_closingTime)
    {
        max_gas_price = _max_gas_price;
    }

    /*
    ** @dev Drain function, in case of failure. Contract should not hold eth anyhow.
    */
    function drain() onlyOwner public {
        wallet.transfer((address(this)).balance);
    }

    /*
    ** @dev Drain tokens to wallet.
    *  For the case someone accidentally send ERC20 tokens to the contract.
    *  @param _token the token to drain.
    */
    function drainTokens(StandardToken _token) onlyOwner public {
        _token.transfer(wallet, _token.balanceOf(address(this)));
    }

    function hasClosed() public view returns (bool) {
        return (capReached() || super.hasClosed());
    }

    /*
    ** @dev Finalizing. Transfer token ownership to wallet for safe-keeping until it will be transferred to the DAO.
    **      Called from the finalize function in FinalizableCrowdsale.
    */
    function finalization() internal {
        MintableToken(token).transferOwnership(wallet);
        super.finalization();
    }

    /*
    ** @dev _prePurchaseAmount. Calculate the acceptable wei amount according to the sale cap.
    **      override  crowdsale _prePurchaseAmount .
    ** @param _weiAmount the amount which is sent to the contract.
    ** @return weiAmount the acceptable amount
    **         changeEthBack ether amount to send back to the purchaser.
    **
    */
    function _prePurchaseAmount(uint _weiAmount) internal returns(uint weiAmount, uint changeEthBack) {
        if (weiRaised.add(_weiAmount) > cap) {
            changeEthBack = weiRaised.add(_weiAmount) - cap;
            weiAmount = _weiAmount.sub(changeEthBack);
            if (weiAmount < minBuy) {
                _setLimits(weiAmount,maxBuy);
            }
        } else {
            weiAmount = _weiAmount;
        }
    }


    /**
     * @dev checking gas price.
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
      require(tx.gasprice <= max_gas_price);
      super._preValidatePurchase();
    }
}
