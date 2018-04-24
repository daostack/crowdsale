const DAOstackSale = artifacts.require('./DAOstackSale.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

//This is a test migration script .
//For real migration values needs to be picked out carefully.

module.exports = async function(deployer) {
    let latestTimeStamp = await web3.eth.getBlock('latest').timestamp;
    let startDelay = 7*24*60*60;
    let duration = 4*7*24*60*60;
    var openingTime = latestTimeStamp + startDelay;
    var closingTime = latestTimeStamp + startDelay + duration;
    var rate = 500;
    var wallet = web3.eth.accounts[5]; //this should be replaced with real wallet account
    var cap = web3.toWei(20);
    var minBuy = web3.toWei(1);
    var maxBuy =  web3.toWei(10);
    var token = await MintableToken.new(); //this should be replaced with GEN DAOToken.
    await deployer.deploy(
                          DAOstackSale,
                          openingTime,
                          closingTime,
                          rate,wallet,
                          cap,minBuy,
                          maxBuy,
                          token.address
                        );
  };
