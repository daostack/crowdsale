const helpers = require('./helpers');
const MintableToken = artifacts.require('./MintableToken.sol');
const BuyLimitsCrowdsaleMock = artifacts.require('./BuyLimitsCrowdsaleMock.sol');

const setup = async function (_min, _max) {
    let token = await MintableToken.new();
    let buyLimitsCrowdsaleMock = await BuyLimitsCrowdsaleMock.new(_min, _max, token.address);
    await token.mint(buyLimitsCrowdsaleMock.address, web3.toWei(100000000));
    return buyLimitsCrowdsaleMock;
};

contract('BuyLimitsCrowdsaleMock', function (accounts)  {

    it("Check owner and limits", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(1), web3.toWei(10));
        let owner = await buyLimitsCrowdsaleMock.owner();
        assert.equal(owner, accounts[0], "Owner was not set correctly");
        assert.equal(await buyLimitsCrowdsaleMock.minBuy(), web3.toWei(1), "Min param is not correct");
        assert.equal(await buyLimitsCrowdsaleMock.maxBuy(), web3.toWei(10), "Min param is not correct");
    });

    it("Set limits - min > max", async () => {
        let token = await MintableToken.new();
        try {
            await BuyLimitsCrowdsaleMock.new(web3.toWei(10), web3.toWei(1), token.address);
        } catch (error) {
            helpers.assertVMException(error);
        }
    });

    it("Check limits - with maximum", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(1), web3.toWei(10));
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(1)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(10)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(3.7)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(0)), false, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(0.99)), false, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(10.01)), false, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(100)), false, 'withinLimits function problem');
    });

    it("Check limits - no maximum", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(4), web3.toWei(0));
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(4)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(4.1)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(100)), true, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(0)), false, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(0.5)), false, 'withinLimits function problem');
        assert.equal(await buyLimitsCrowdsaleMock.withinLimits(web3.toWei(1)), false, 'withinLimits function problem');
    });

    it("Try sending legit values - with maximum", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(1), web3.toWei(10));
        let wallet = await buyLimitsCrowdsaleMock.wallet();
        let balanceBefore = await web3.eth.getBalance(wallet);
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(10)} );
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(1)} );
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(3.5)} );
        let balanceAfter = await web3.eth.getBalance(wallet);
        assert.equal(balanceAfter.minus(balanceBefore), web3.toWei(14.5), 'Balance is not correct');
    });

    it("Try sending legit values - no maximum", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(3), web3.toWei(0));
        let wallet = await buyLimitsCrowdsaleMock.wallet();
        let balanceBefore = await web3.eth.getBalance(wallet);
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(3)} );
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(7)} );
        await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(11)} );
        let balanceAfter = await web3.eth.getBalance(wallet);
        assert.equal(balanceAfter.minus(balanceBefore), web3.toWei(21), 'Balance is not correct');
    });

    it("Try sending forbidden values - with maxumim", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(1), web3.toWei(10));
        let wallet = await buyLimitsCrowdsaleMock.wallet();
        let balanceBefore = await web3.eth.getBalance(wallet);

        try {
            await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(0.9)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        try {
            await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(10.1)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        let balanceAfter = await web3.eth.getBalance(wallet);
        assert.equal(balanceAfter.minus(balanceBefore), web3.toWei(0), 'Balance is not correct');
    });

    it("Try sending forbidden values - no maxumim", async () => {
        let buyLimitsCrowdsaleMock = await setup(web3.toWei(3), web3.toWei(0));
        let wallet = await buyLimitsCrowdsaleMock.wallet();
        let balanceBefore = await web3.eth.getBalance(wallet);

        try {
            await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(0.9)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        try {
            await buyLimitsCrowdsaleMock.buyTokens(accounts[1], {from: accounts[1], value: web3.toWei(2.9)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        let balanceAfter = await web3.eth.getBalance(wallet);
        assert.equal(balanceAfter.minus(balanceBefore), web3.toWei(0), 'Balance is not correct');
    });
});
