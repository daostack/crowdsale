pragma solidity 0.4.19;

import "./zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "./WhiteList.sol";
import "./LimitPayable.sol";


contract DAOstackSale is Crowdsale, CappedCrowdsale, FinalizableCrowdsale, LimitPayable, WhiteList {
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

    function validPurchase() internal view returns (bool) {
        return (whiteListed(msg.sender) && withinLimits() && super.validPurchase());
    }

    /*
    ** Drain function, in case of failiure. Contract should not hold eth anyhow/
    */
    function drain() onlyOwner public {
        wallet.transfer(this.balance);
    }

    /*
    ** Finalizing. Transfering ownership to wallet for keeping until it will be tranfferd to the DAO.
    */
    function finalization() internal {
        token.transferOwnership(wallet);
    }

}
