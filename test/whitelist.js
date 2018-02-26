const helpers = require('./helpers');
const WhiteList = artifacts.require('./WhiteList.sol');

const setup = async function () {
  let whiteList = await WhiteList.new();
  return whiteList;
};

contract('WhiteList', function (accounts)  {

    it("Check owner", async () => {
        let whiteList = await setup();
        let owner = await whiteList.owner();
        assert.equal(owner, accounts[0], "Owner was not set correctly");
    });

    it("Add to whitelist - owner", async () => {
        let whiteList = await setup();
        let tx;

        // Add one:
        tx = await whiteList.addToWhiteList(accounts[1]);
        assert(await whiteList.whiteList(accounts[1]), "whitelisting was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 1, "whitelist size is not correct");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogWhiteListAdd'), accounts[1]);

        // Add second:
        tx = await whiteList.addToWhiteList(accounts[2]);
        assert(await whiteList.whiteList(accounts[2]), "whitelisting was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 2, "whitelist size is not correct");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogWhiteListAdd'), accounts[2]);
    });

    it("Add to whitelist - not owner", async () => {
        let whiteList = await setup();

        // Try to add one:
        try {
            await whiteList.addToWhiteList(accounts[0], { from: accounts[1] });
            assert(false, 'Not owenr was able to add to list');
        } catch (error) {
            helpers.assertVMException(error);
        }
    });

    it("Remove from whitelist - owner", async () => {
        let whiteList = await setup();
        let tx;

        // Add:
        await whiteList.addToWhiteList(accounts[1]);
        await whiteList.addToWhiteList(accounts[2]);

        // Remove one:
        tx = await whiteList.removeFromWhiteList(accounts[1]);
        assert(!(await whiteList.whiteList(accounts[1])), "removing was unseccessfull");
        assert(await whiteList.whiteList(accounts[2]), "removing was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 1, "whitelist size is not correct");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogWhiteListRemove'), accounts[1]);

        // Remove two:
        tx = await whiteList.removeFromWhiteList(accounts[2]);
        assert(!(await whiteList.whiteList(accounts[1])), "removing was unseccessfull");
        assert(!(await whiteList.whiteList(accounts[2])), "removing was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 0, "whitelist size is not correct");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogWhiteListRemove'), accounts[2]);
    });

    it("Remove from whitelist - not owner", async () => {
        let whiteList = await setup();

        // Add:
        await whiteList.addToWhiteList(accounts[1]);

        // Try to add one:
        try {
            await whiteList.removeFromWhiteList(accounts[1], { from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
        assert(await whiteList.whiteList(accounts[1]), "non-owner was able to remove");
        assert(await whiteList.whiteListSize(), 1, "whitelist size is not correct");
    });

    it("Add twice", async () => {
        let whiteList = await setup();

        // Add first time:
        await whiteList.addToWhiteList(accounts[1]);
        assert(await whiteList.whiteList(accounts[1]), "whitelisting was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 1, "whitelist size is not correct");

        // Add second time:
        await whiteList.addToWhiteList(accounts[1]);
        assert(await whiteList.whiteList(accounts[1]), "whitelisting was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 1, "whitelist size is not correct");
    });

    it("Remove twice", async () => {
        let whiteList = await setup();

        // Add:
        await whiteList.addToWhiteList(accounts[1]);
        assert(await whiteList.whiteList(accounts[1]), "whitelisting was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 1, "whitelist size is not correct");

        // Remove first time:
        await whiteList.removeFromWhiteList(accounts[1]);
        assert(!(await whiteList.whiteList(accounts[1])), "removing was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 0, "whitelist size is not correct");

        // Remove second time:
        await whiteList.removeFromWhiteList(accounts[1]);
        assert(!(await whiteList.whiteList(accounts[1])), "removing was unseccessfull");
        assert.equal(await whiteList.whiteListSize(), 0, "whitelist size is not correct");
    });

});
