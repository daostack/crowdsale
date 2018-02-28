const helpers = require('./helpers');
const WhiteList = artifacts.require('./WhiteListMock.sol');

const setup = async function () {
  let whitelist = await WhiteList.new();
  return whitelist;
};

contract('WhiteList', function (accounts)  {

    it("Check owner", async () => {
        let whitelist = await setup();
        let owner = await whitelist.owner();
        assert.equal(owner, accounts[0], "Owner was not set correctly");
    });

    it("Add to whitelist - owner", async () => {
        let whitelist = await setup();
        let tx;

        // Add one:
        tx = await whitelist.addToWhitelist(accounts[1]);
        assert(await whitelist.whitelist(accounts[1]), "whitelisting was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogAddedToWhiteList'), accounts[1]);

        // Add second:
        tx = await whitelist.addToWhitelist(accounts[2]);
        assert(await whitelist.whitelist(accounts[2]), "whitelisting was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogAddedToWhiteList'), accounts[2]);

        tx = await whitelist.addManyToWhitelist([accounts[3],[accounts[4]]]);
        assert(await whitelist.whitelist(accounts[3]), "whitelisting was unsuccessful");
        assert(await whitelist.whitelist(accounts[4]), "whitelisting was unsuccessful");
        assert.equal(tx.logs.length, 2);
        assert.equal(tx.logs[0].event, "LogAddedToWhiteList");
        assert.equal(tx.logs[0].args._address, accounts[3]);
        assert.equal(tx.logs[1].event, "LogAddedToWhiteList");
        assert.equal(tx.logs[1].args._address, accounts[4]);

    });

    it("Add to whitelist - not owner", async () => {
        let whitelist = await setup();

        // Try to add one:
        try {
            await whitelist.addToWhitelist(accounts[0], { from: accounts[1] });
            assert(false, 'Not owenr was able to add to list');
        } catch (error) {
            helpers.assertVMException(error);
        }

        // Try to add many:
        try {
            await whitelist.addManyToWhitelist([accounts[0],accounts[1]], { from: accounts[1] });
            assert(false, 'Not owenr was able to add to list');
        } catch (error) {
            helpers.assertVMException(error);
        }
    });

    it("Remove from whitelist - owner", async () => {
        let whitelist = await setup();
        let tx;

        // Add:
        await whitelist.addToWhitelist(accounts[1]);
        await whitelist.addToWhitelist(accounts[2]);

        // Remove one:
        tx = await whitelist.removeFromWhitelist(accounts[1]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");
        assert(await whitelist.whitelist(accounts[2]), "removing was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogRemovedFromWhiteList'), accounts[1]);

        // Remove two:
        tx = await whitelist.removeFromWhitelist(accounts[2]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");
        assert(!(await whitelist.whitelist(accounts[2])), "removing was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, '_address', 'LogRemovedFromWhiteList'), accounts[2]);
    });

    it("Remove from whitelist - not owner", async () => {
        let whitelist = await setup();

        // Add:
        await whitelist.addToWhitelist(accounts[1]);

        // Try to add one:
        try {
            await whitelist.removeFromWhitelist(accounts[1], { from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
        assert(await whitelist.whitelist(accounts[1]), "non-owner was able to remove");
    });

    it("Add twice", async () => {
        let whitelist = await setup();

        // Add first time:
        await whitelist.addToWhitelist(accounts[1]);
        assert(await whitelist.whitelist(accounts[1]), "whitelisting was unsuccessful");

        // Add second time:
        await whitelist.addToWhitelist(accounts[1]);
        assert(await whitelist.whitelist(accounts[1]), "whitelisting was unsuccessful");
    });

    it("Remove twice", async () => {
        let whitelist = await setup();

        // Add:
        await whitelist.addToWhitelist(accounts[1]);
        assert(await whitelist.whitelist(accounts[1]), "whitelisting was unsuccessful");

        // Remove first time:
        await whitelist.removeFromWhitelist(accounts[1]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");

        // Remove second time:
        await whitelist.removeFromWhitelist(accounts[1]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");
    });

});
