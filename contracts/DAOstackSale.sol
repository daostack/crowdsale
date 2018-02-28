pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./LimitPayable.sol";


contract DAOstackSale is MintedCrowdsale, CappedCrowdsale, FinalizableCrowdsale, LimitPayable, WhitelistedCrowdsale {
    using SafeMath for uint256;

    function () external payable {
        uint256 weiAmount = msg.value;
        uint changeEthBack;
        if (!capReached() && weiRaised.add(weiAmount) > cap) {
            changeEthBack = weiRaised.add(weiAmount) - cap;
            weiAmount = weiAmount.sub(changeEthBack);
        }
        buyTokens(msg.sender,weiAmount);
        if (changeEthBack > 0) {
            msg.sender.transfer(changeEthBack);
        }
    }
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
    ) public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        LimitPayable(_minBuy, _maxBuy)
        TimedCrowdsale(_openingTime,_closingTime)
    {
    }

    /*
    ** @dev Check a Purchase is valid, check that msg.sender is whitelisted,
    **      msg.value is within limits, and call super validPurchase.
    **      This function is called from buy at crowdsale.sol
    */
    /*function validPurchase() internal view returns (bool) {
        return (whiteList[msg.sender] && withinLimits(msg.value) && super.validPurchase());
    }*/

    /*
    ** @dev Drain function, in case of failure. Contract should not hold eth anyhow.
    */
    function drain() onlyOwner public {
        wallet.transfer(this.balance);
    }

    /*
    ** @dev Finalizing. Transfer the remaining tokens back to wallet for safe-keeping until it will be transferred to the DAO.
    **      Called from the finialize function in FinalizableCrowdsale.
    */
    function finalization() internal {
        MintableToken(token).transferOwnership(wallet);
    }
}
