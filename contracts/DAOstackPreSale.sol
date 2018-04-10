pragma solidity ^0.4.21;


import "./lifecycle/Pausable.sol";
import "./ownership/Whitelist.sol";
import "./BuyLimits.sol";

/**
 * @title DAOstackPresale
 * @dev A contract to allow only whitelisted followers to participate in presale.
 */
contract DAOstackPreSale is Pausable,BuyLimits,Whitelist {
    event LogFundsReceived(address indexed _sender, uint _amount);

    address public wallet; // Amount of wei raised

    /**
    * @dev Constructor.
    * @param _wallet Address where the funds are transfered to
    * @param _minBuy Address where the funds are transfered to
    * @param _maxBuy Address where the funds are transfered to
    */
    function DAOstackPreSale(address _wallet, uint _minBuy, uint _maxBuy)
    public
    BuyLimits(_minBuy, _maxBuy)
    {
        // Set wallet:
        require(_wallet != address(0));
        wallet = _wallet;
    }

    /**
    * @dev Fallback, funds coming in are transfered to wallet
    */
    function () payable whenNotPaused onlyWhitelisted isWithinLimits(msg.value) external {
        wallet.transfer(msg.value);
        emit LogFundsReceived(msg.sender, msg.value);
    }

    /*
    ** @dev Drain function, in case of failure. Contract should not hold eth anyhow.
    */
    function drain() external {
        wallet.transfer((address(this)).balance);
    }

}
