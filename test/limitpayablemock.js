const helpers = require('./helpers');
const LimitPayableMock = artifacts.require('./LimitPayableMock.sol');

const setup = async function (_min, _max) {
  let limitPayableMock = await LimitPayableMock.new(_min, _max);
  return limitPayableMock;
};

contract('LimitPayableMock', function (accounts)  {

    it("Check owner and limits", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));
        let owner = await limitPayableMock.owner();
        assert.equal(owner, accounts[0], "Owner was not set correctly");
        assert.equal(await limitPayableMock.minPay(), web3.toWei(1), "Min param is not correct");
        assert.equal(await limitPayableMock.maxPay(), web3.toWei(10), "Min param is not correct");
    });

    it("Change limits - owner", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));

        let tx = await limitPayableMock.changeLimits(web3.toWei(0), web3.toWei(7));
        assert.equal(await limitPayableMock.minPay(), web3.toWei(0), "Min param is not correct");
        assert.equal(await limitPayableMock.maxPay(), web3.toWei(7), "Min param is not correct");
        assert.equal(helpers.getValueFromLogs(tx, '_minPay', 'LogLimitsChanged'), web3.toWei(0));
        assert.equal(helpers.getValueFromLogs(tx, '_maxPay', 'LogLimitsChanged'), web3.toWei(7));
    });

    it("Change limits - not owner", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));

        try {
            await limitPayableMock.changeLimits(web3.toWei(0), web3.toWei(7), { from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
        assert.equal(await limitPayableMock.minPay(), web3.toWei(1), "Min param is not correct");
        assert.equal(await limitPayableMock.maxPay(), web3.toWei(10), "Min param is not correct");
    });

    it("Change limits - min > max", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));

        try {
            await limitPayableMock.changeLimits(web3.toWei(7), web3.toWei(3));
        } catch (error) {
            helpers.assertVMException(error);
        }
        assert.equal(await limitPayableMock.minPay(), web3.toWei(1), "Min param is not correct");
        assert.equal(await limitPayableMock.maxPay(), web3.toWei(10), "Min param is not correct");
    });

    it("Check limits", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(1)), true, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(10)), true, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(3.7)), true, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(0)), false, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(0.99)), false, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(10.01)), false, 'withinLimits function problem');
        assert.equal(await limitPayableMock.withinLimits(web3.toWei(100)), false, 'withinLimits function problem');
    });

    it("Try sending legit values", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));

        await web3.eth.sendTransaction( {to: limitPayableMock.address, from: accounts[1], value: web3.toWei(10)} );
        await web3.eth.sendTransaction( {to: limitPayableMock.address, from: accounts[1], value: web3.toWei(1)} );
        await web3.eth.sendTransaction( {to: limitPayableMock.address, from: accounts[1], value: web3.toWei(3.5)} );
        assert.equal(await web3.eth.getBalance(limitPayableMock.address), web3.toWei(14.5), 'Balance is not correct');
    });

    it("Try sending forbidden values", async () => {
        let limitPayableMock = await setup(web3.toWei(1), web3.toWei(10));

        try {
            await web3.eth.sendTransaction( {to: limitPayableMock.address, from: accounts[1], value: web3.toWei(0.9)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        try {
            await web3.eth.sendTransaction( {to: limitPayableMock.address, from: accounts[1], value: web3.toWei(10.1)} );
        } catch (error) {
            helpers.assertVMException(error);
        }

        assert.equal(await web3.eth.getBalance(limitPayableMock.address), web3.toWei(0), 'Balance is not correct');
    });
});
