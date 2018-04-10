const DAOstackPreSale = artifacts.require('./DAOstackPreSale.sol');

//This is a test migration script .
//For real migration values needs to be picked out carefully.

module.exports = async function(deployer) {
    var wallet = web3.eth.accounts[5]; //this should be replaced with real wallet account
    var minBuy = web3.toWei(1);
    var maxBuy =  web3.toWei(10);
    await deployer.deploy(DAOstackPreSale,wallet,minBuy,maxBuy).then(async function(){
      });
  };
