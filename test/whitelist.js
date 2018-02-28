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

        // Add one:
        await whitelist.addToWhitelist(accounts[1]);
        assert(await whitelist.whitelist(accounts[1]), "whitelisting was unsuccessful");

        // Add second:
        await whitelist.addToWhitelist(accounts[2]);
        assert(await whitelist.whitelist(accounts[2]), "whitelisting was unsuccessful");
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
    });

    it("Remove from whitelist - owner", async () => {
        let whitelist = await setup();

        // Add:
        await whitelist.addToWhitelist(accounts[1]);
        await whitelist.addToWhitelist(accounts[2]);

        // Remove one:
        await whitelist.removeFromWhitelist(accounts[1]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");
        assert(await whitelist.whitelist(accounts[2]), "removing was unsuccessful");

        // Remove two:
        await whitelist.removeFromWhitelist(accounts[2]);
        assert(!(await whitelist.whitelist(accounts[1])), "removing was unsuccessful");
        assert(!(await whitelist.whitelist(accounts[2])), "removing was unsuccessful");
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
