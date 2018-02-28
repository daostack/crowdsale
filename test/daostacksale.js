const helpers = require('./helpers');
//const BigNumber = require('bignumber.js');
const DAOstackSale = artifacts.require('./DAOstackSale.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

const BigNumber = web3.BigNumber;

let token;
let params;
let daoStackSale;
let whiteListed;
let notWhiteListed;
const setup = async function () {
    let accounts = web3.eth.accounts;
    token = await MintableToken.new();
    let startDelay = 7*24*60*60;
    let duration = 4*7*24*60*60;
    let latestTimeStamp = await web3.eth.getBlock('latest').timestamp;
    params = {
        owner: accounts[0],
        startDelay: startDelay,
        openingTime: latestTimeStamp + startDelay,
        duration: duration,
        closingTime: latestTimeStamp + startDelay + duration,
        rate: 500,
        wallet: accounts[5],
        cap: web3.toWei(20),
        minBuy: web3.toWei(1),
        maxBuy: web3.toWei(10),
    };
    daoStackSale = await DAOstackSale.new(
        params.openingTime,
        params.closingTime,
        params.rate,
        params.wallet,
        params.cap,
        params.minBuy,
        params.maxBuy,
        token.address
    );
    await daoStackSale.addToWhitelist(accounts[1]);
    await daoStackSale.addToWhitelist(accounts[2]);
    await daoStackSale.addToWhitelist(accounts[3]);
    whiteListed = [accounts[1], accounts[2], accounts[3]];
    notWhiteListed = [accounts[4]];
    await token.transferOwnership(daoStackSale.address);
    //await token.mint(daoStackSale.address,tokenSupply);
    return { daoStackSale, token, params };
};


const buy = async function (buyer, value, shouldSucceed) {
    let preBuyerTokenBalance = await token.balanceOf(buyer);
    let preWalletBalance = await web3.eth.getBalance(params.wallet);
    let preWeiRaised = await daoStackSale.weiRaised();

    // Separate to cases:
    let balanceChange = new BigNumber(0);
    let tokenChange = new BigNumber(0);
    let capReached = await daoStackSale.capReached();
    let changeEthBack = new BigNumber(0);
    if (shouldSucceed === true) {
        await web3.eth.sendTransaction( { from: buyer, to: daoStackSale.address, value: value, gas: 200000 } ); // Min sending gas (21k) is not enough
        if (!capReached && Number(preWeiRaised.plus(value)) > params.cap) {
            changeEthBack = preWeiRaised.plus(value) - params.cap;
            value = value - changeEthBack;
        }
        balanceChange = value;
        tokenChange   = value * params.rate;
    } else {
        try {
            await web3.eth.sendTransaction( { from: buyer, to: daoStackSale.address, value: value, gas: 200000 } );  // Min sending gas (21k) is not enough
        } catch (error) {
            helpers.assertVMException(error, 'Buying should have failed but did not');
        }
    }
    let postBuyerTokenBalance = await token.balanceOf(buyer);
    let postWalletBalance = await web3.eth.getBalance(params.wallet);
    let postWeiRaised = await daoStackSale.weiRaised();
    assert.equal(postWeiRaised.toString(), (preWeiRaised.plus(balanceChange)).toString(), 'Wrong wei raised variable');
    assert.equal(postWalletBalance.toString(), (preWalletBalance.plus(balanceChange)).toString(), 'Wrong wallet balance');
    assert.equal(postBuyerTokenBalance.toString(), (preBuyerTokenBalance.plus(tokenChange)).toString(), 'Wrong token balance');

};

contract('DAOstackSale', function (accounts)  {

    it("Check owner and params", async () => {
        await setup();

        // Check owner:
        assert.equal(await daoStackSale.owner(), accounts[0], "Owner was not set correctly");

        // Check params:
        assert.equal(await daoStackSale.token(), token.address, "Token is not correct");
        assert.equal(await daoStackSale.openingTime(), params.openingTime, "openingTime is not correct");
        assert.equal(await daoStackSale.closingTime(), params.closingTime, "closingTime is not correct");
        assert.equal(await daoStackSale.wallet(), params.wallet, "Wallet is not correct");
        assert.equal(await daoStackSale.minPay(), params.minBuy, "Min param is not correct");
        assert.equal(await daoStackSale.maxPay(), params.maxBuy, "Max param is not correct");
        assert.equal(await daoStackSale.cap(), params.cap, "Cap param is not correct");
        assert.equal(await daoStackSale.rate(), params.rate, "Rate param is not correct");
    });

    it("Try to buy before sale started", async () => {
        await setup();
        await buy(accounts[0], web3.toWei(1), false);
        await buy(whiteListed[0], web3.toWei(1), false);
        await buy(notWhiteListed[0], web3.toWei(1), false);
    });

    it("Buy while sale ongoing - whitelisted", async () => {
        await setup();
        await helpers.increaseTime(params.startDelay + 60*60);
        await buy(whiteListed[0], web3.toWei(1.5), true);
        await buy(whiteListed[1], web3.toWei(1), true);
    });

    it("Try buying from non whitelist account", async () => {
        await setup();
        await helpers.increaseTime(params.startDelay + 1);
        await buy(notWhiteListed[0], web3.toWei(1), false);
    });

    it("Try to buy outside limits", async () => {
        await setup();
        await helpers.increaseTime(params.startDelay + 60*60);
        await buy(whiteListed[0], web3.toWei(0.5), false);
        await buy(whiteListed[1], web3.toWei(11), false);
    });

    it("Try to go over cap", async () => {
        await setup();
        await helpers.increaseTime(params.startDelay + 60*60);
        await buy(whiteListed[0], web3.toWei(8), true);
        await buy(whiteListed[1], web3.toWei(8), true);
        assert.equal(await daoStackSale.capReached(),false);
        //partial cap
        await buy(whiteListed[1], web3.toWei(5), true);
        assert.equal(await daoStackSale.capReached(),true);
        //cap reached.
        await buy(whiteListed[1], web3.toWei(1), false);
    });


    it("Full Scenario 1, cap filled", async () => {
        await setup();

        // People try to buy before:
        await buy(whiteListed[0], web3.toWei(1), false);
        await buy(notWhiteListed[0], web3.toWei(1), false);

        // Start:
        await helpers.increaseTime(params.startDelay + 60*60);

        // buying attempts, listed, non-listed, in limit and outside limits:
        await buy(whiteListed[0], web3.toWei(0.5), false);
        await buy(whiteListed[0], web3.toWei(4), true);
        await buy(notWhiteListed[0], web3.toWei(4), false);
        await buy(whiteListed[1], web3.toWei(11), false);
        await buy(whiteListed[1], web3.toWei(9), true);

        // Reaching cap:
        await buy(whiteListed[2], web3.toWei(7), true);

        // Try to buy after cap reached:
        await buy(whiteListed[0], web3.toWei(2), false);

        try {
            await daoStackSale.finalize();
        } catch (error) {
            helpers.assertVMException(error, 'finalize should revert because crowdsale not reached the time cap yet.');
        }

        await helpers.increaseTime(params.duration);

        // Check finalization:

        // Try to buy after finish:
        await buy(whiteListed[0], web3.toWei(2), false);

        await daoStackSale.finalize();

        assert.equal(await token.owner(), params.wallet);

        // Try to buy again after finish:
        await buy(whiteListed[0], web3.toWei(2), false);

        // Check no ethers left on contract, and no
        assert.equal(await web3.eth.getBalance(daoStackSale.address), 0, 'Funds left on contract');

        // Check drain by owner and non-owner:
        await daoStackSale.drain(); // Just chack it does not revert
        try {
            await daoStackSale.drain({ from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
    });

    it("Full Scenario 2, time cap", async () => {
        await setup();

        // People try to buy before:
        await buy(whiteListed[0], web3.toWei(1), false);
        await buy(notWhiteListed[0], web3.toWei(1), false);

        // Start:
        await helpers.increaseTime(params.startDelay + 60*60);

        // buying attempts, listed, non-listed, in limit and outside limits:
        await buy(whiteListed[0], web3.toWei(0.5), false);
        await buy(whiteListed[0], web3.toWei(4), true);
        await buy(notWhiteListed[0], web3.toWei(4), false);
        await buy(whiteListed[1], web3.toWei(11), false);
        await buy(whiteListed[1], web3.toWei(9), true);

        // Reaching time cap:
        await helpers.increaseTime(params.duration);

        // Try to buy after time cap :
        await buy(whiteListed[0], web3.toWei(2), false);

        // Check finalization:
        await daoStackSale.finalize();
        assert.equal(await token.owner(), params.wallet);

        // Try to buy again after finish:
        await buy(whiteListed[0], web3.toWei(2), false);

        // Check no ethers left on contract, and no
        assert.equal(await web3.eth.getBalance(daoStackSale.address), 0, 'Funds left on contract');

        // Check drain by owner and non-owner:
        await daoStackSale.drain(); // Just chack it does not revert
        try {
            await daoStackSale.drain({ from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
    });
});
