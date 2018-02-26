pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "./WhiteList.sol";
import "./LimitPayable.sol";


contract DAOstackSale is Crowdsale, CappedCrowdsale, FinalizableCrowdsale, LimitPayable, WhiteList {

    /*
    ** @dev constructor.
    ** @param _startTime the time sale start.
    ** @param _endTime the time sale ends.
    ** @param _rate the sale rate, buyer gets tokens = _rates * msg.value.
    ** @param _wallet the DAOstack multi-sig address.
    ** @param _cap the sale cap.
    ** @param _minBuy the min amount (in Wei) one can buy with.
    ** @param _maxBuy the max amount (in Wei) one can buy with.
    ** @param _token the mintable token contract.
    */
    function DAOstackSale(
        uint _startTime,
        uint _endTime,
        uint _rate,
        address _wallet,
        uint _cap,
        uint _minBuy,
        uint _maxBuy,
        MintableToken _token
    ) public
        Crowdsale(_startTime, _endTime, _rate, _wallet, _token)
        CappedCrowdsale(_cap)
        LimitPayable(_minBuy, _maxBuy)
    {
    }

    /*
    ** @dev Check a Purchase is valid, check that msg.sender is whitelisted,
    **      msg.value is within limits, and call super validPurchase.
    **      This function is called from buy at crowdsale.sol
    */
    function validPurchase() internal view returns (bool) {
        return (whiteList[msg.sender] && withinLimits(msg.value) && super.validPurchase());
    }

    /*
    ** @dev Drain function, in case of failure. Contract should not hold eth anyhow.
    */
    function drain() onlyOwner public {
        wallet.transfer(this.balance);
    }

    /*
    ** @dev Finalizing. Finalizing. Transfering ownership to wallet for safe-keeping until it will be tranfferd to the DAO.
    **      Called from the finialize function in FinalizableCrowdsale.
    */
    function finalization() internal {
        token.transferOwnership(wallet);
    }

}
