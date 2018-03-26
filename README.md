# DAOstack crowdsale

DAOstack crowdsale smart contracts are based on [zeppline-solidity](https://github.com/OpenZeppelin/zeppelin-solidity) crowdsale contracs V 1.0.7. 

The following contracts where modified/added to support DAOstack crowdsale needs :
- Crowdsale.sol - modified in order to enable partial refunds in CappedCrowdsale.
- BuyLimitCrowdSale.sol - added in order to support minimum and maximum token purchase.
- WhiteListedCrowdSale - modified to add events for adding and removing white listed addresses.

All contracts where modified to be compiled with the latest solidity compiler version.  
