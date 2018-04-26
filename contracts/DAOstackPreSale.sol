pragma solidity ^0.4.21;


import "./lifecycle/Pausable.sol";
import "./ownership/Whitelist.sol";
import "./BuyLimits.sol";

/**
 * @title DAOstackPresale
 * @dev
 * - Allow only Whitelisted followers to participate in the presale.
 * - Pausable by owner.Contract will accept funds only when it is unpaused.
 * - Funds transfer to this contract will be sent automatically to  wallet address.
 * - Funds below minimum allowed value will be rejected.
 * - If maximum allowed value is set - funds over maximum allowed value will be rejected.
 */
contract DAOstackPreSale is Pausable,BuyLimits,Whitelist {
    event LogFundsReceived(address indexed _sender, uint _amount);

    address public wallet;

    /**
    * @dev Constructor.
    * @param _wallet Address where the funds will be transfer to
    * @param _minBuy minimum buy in wei
    * @param _maxBuy maximum buy in wei ,0 means no maximum
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
    * @dev Fallback, funds coming in are transferred to wallet
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
