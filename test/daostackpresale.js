const helpers = require('./helpers');
const DAOstackPreSale = artifacts.require('./DAOstackPreSale.sol');

const BigNumber = web3.BigNumber;

let params;
let daoStackPreSale;
let whiteListed;
let notWhiteListed;

const setup = async function (_min = 1, _max = 10) {
    let accounts = web3.eth.accounts;
    params = {
        owner: accounts[0],
        wallet: accounts[5],
        min: web3.toWei(_min),
        max: web3.toWei(_max),
    };
    daoStackPreSale = await DAOstackPreSale.new(params.wallet, params.min, params.max, { from: params.owner });
    await daoStackPreSale.addAddressToWhitelist(accounts[1]);
    await daoStackPreSale.addAddressToWhitelist(accounts[2]);
    await daoStackPreSale.addAddressToWhitelist(accounts[3]);
    whiteListed = [accounts[1], accounts[2], accounts[3]];
    notWhiteListed = [accounts[4]];
    return { daoStackPreSale, params };
};

const send = async function (sender, value, shouldSucceed) {
    let preWalletBalance = await web3.eth.getBalance(params.wallet);
    let preSenderBalance = await web3.eth.getBalance(sender);

    // Separate to cases:
    let balanceChange = new BigNumber(0);
    let txHash;
    let gasUsed;
    let gasPrice;
    let gasPaid;

    if (shouldSucceed === true) {
        txHash = await web3.eth.sendTransaction( { from: sender, to: daoStackPreSale.address, value: value, gas: 350000 } ); // Min sending gas (21k) is not enough
        gasPrice = await web3.eth.getTransaction(txHash).gasPrice;
        gasUsed = await web3.eth.getTransactionReceipt(txHash).cumulativeGasUsed;
        gasPaid = new BigNumber(Number(gasUsed) * gasPrice);
        balanceChange = value;
    } else {
        try {
            await web3.eth.sendTransaction( { from: sender, to: daoStackPreSale.address, value: value, gas: 200000 } );  // Standard sending gas (21k) is not enough
        } catch (error) {
            helpers.assertVMException(error, 'Sender should have failed but did not');
        }
    }
    let postWalletBalance = await web3.eth.getBalance(params.wallet);
    let postSenderBalance = await web3.eth.getBalance(sender);
    assert.equal(postWalletBalance.toString(), (preWalletBalance.plus(balanceChange)).toString(), 'Wrong wallet balance');
    if (shouldSucceed === true) {
        assert.equal(postSenderBalance.toString(), (preSenderBalance.minus(balanceChange).minus(gasPaid)).toString(), 'Wrong sender wei balance');
   }

};

contract('DAOstackPreSale', function (accounts)  {

    it("Check owner and params", async () => {
        await setup();

        // Check owner:
        assert.equal(await daoStackPreSale.owner(), accounts[0], "Owner was not set correctly");

        // Check params:
        assert.equal(await daoStackPreSale.wallet(), params.wallet, "Wallet is not correct");
        assert.equal(await daoStackPreSale.minBuy(), params.min, "Min param is not correct");
        assert.equal(await daoStackPreSale.maxBuy(), params.max, "Max param is not correct");
    });

    it("Add to whitelist - owner", async () => {
        await setup();
        let tx;

        // Add one:
        tx = await daoStackPreSale.addAddressToWhitelist(accounts[4]);
        assert(await daoStackPreSale.whitelist(accounts[4]), "whitelisting was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, 'addr', 'WhitelistedAddressAdded'), accounts[4]);

        // Add second:
        tx = await daoStackPreSale.addAddressToWhitelist(accounts[5]);
        assert(await daoStackPreSale.whitelist(accounts[5]), "whitelisting was unsuccessful");

        assert.equal(helpers.getValueFromLogs(tx, 'addr', 'WhitelistedAddressAdded'), accounts[5]);

        tx = await daoStackPreSale.addAddressesToWhitelist([accounts[6],[accounts[7]]]);
        assert(await daoStackPreSale.whitelist(accounts[6]), "whitelisting was unsuccessful");
        assert(await daoStackPreSale.whitelist(accounts[7]), "whitelisting was unsuccessful");
        assert.equal(tx.logs.length, 2);
        assert.equal(tx.logs[0].event, "WhitelistedAddressAdded");
        assert.equal(tx.logs[0].args.addr, accounts[6]);
        assert.equal(tx.logs[1].event, "WhitelistedAddressAdded");
        assert.equal(tx.logs[1].args.addr, accounts[7]);

    });

    it("Add to whitelist - not owner", async () => {
        await setup();

        // Try to add one:
        try {
            await daoStackPreSale.addAddressToWhitelist(accounts[0], { from: accounts[1] });
            assert(false, 'Not owenr was able to add to list');
        } catch (error) {
            helpers.assertVMException(error);
        }

        // Try to add many:
        try {
            await daoStackPreSale.addAddressesToWhitelist([accounts[0],accounts[1]], { from: accounts[1] });
            assert(false, 'Not owenr was able to add to list');
        } catch (error) {
            helpers.assertVMException(error);
        }
    });

    it("Remove from whitelist - owner", async () => {
        await setup();
        let tx;

        // Add:
        await daoStackPreSale.addAddressToWhitelist(accounts[4]);
        await daoStackPreSale.addAddressToWhitelist(accounts[5]);

        // Remove one:
        tx = await daoStackPreSale.removeAddressFromWhitelist(accounts[4]);
        assert(!(await daoStackPreSale.whitelist(accounts[4])), "removing was unsuccessful");
        assert(await daoStackPreSale.whitelist(accounts[5]), "removing was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, 'addr', 'WhitelistedAddressRemoved'), accounts[4]);

        // Remove two:
        tx = await daoStackPreSale.removeAddressFromWhitelist(accounts[5]);
        assert(!(await daoStackPreSale.whitelist(accounts[5])), "removing was unsuccessful");
        assert(!(await daoStackPreSale.whitelist(accounts[4])), "removing was unsuccessful");
        assert.equal(helpers.getValueFromLogs(tx, 'addr', 'WhitelistedAddressRemoved'), accounts[5]);
    });

    it("Remove from whitelist - not owner", async () => {
        await setup();

        // Add:
        await daoStackPreSale.addAddressToWhitelist(accounts[1]);

        // Try to add one:
        try {
            await daoStackPreSale.removeAddressFromWhitelist(accounts[1], { from: accounts[1] });
        } catch (error) {
            helpers.assertVMException(error);
        }
        assert(await daoStackPreSale.whitelist(accounts[1]), "non-owner was able to remove");
    });

    it("Add twice", async () => {
        await setup();

        // Add first time:
        await daoStackPreSale.addAddressToWhitelist(accounts[1]);
        assert(await daoStackPreSale.whitelist(accounts[1]), "whitelisting was unsuccessful");

        // Add second time:
        await daoStackPreSale.addAddressToWhitelist(accounts[1]);
        assert(await daoStackPreSale.whitelist(accounts[1]), "whitelisting was unsuccessful");
    });

    it("Remove twice", async () => {
        await setup();

        // Add:
        await daoStackPreSale.addAddressToWhitelist(accounts[1]);
        assert(await daoStackPreSale.whitelist(accounts[1]), "whitelisting was unsuccessful");

        // Remove first time:
        await daoStackPreSale.removeAddressFromWhitelist(accounts[1]);
        assert(!(await daoStackPreSale.whitelist(accounts[1])), "removing was unsuccessful");

        // Remove second time:
        await daoStackPreSale.removeAddressFromWhitelist(accounts[1]);
        assert(!(await daoStackPreSale.whitelist(accounts[1])), "removing was unsuccessful");
    });

    it("Try to send when paused", async () => {
        await setup();

        await daoStackPreSale.pause();
        await send(accounts[0], web3.toWei(2), false);
        await send(whiteListed[0], web3.toWei(2), false);
        await send(notWhiteListed[0], web3.toWei(2), false);
    });

    it("Send while presale ongoing - whitelisted", async () => {
        await setup();
        await send(whiteListed[0], web3.toWei(1.5), true);
        await send(whiteListed[1], web3.toWei(1), true);
    });

    it("Try sending from non whitelist account", async () => {
        await setup();
        await send(notWhiteListed[0], web3.toWei(2), false);
    });

    it("Try to send outside limits", async () => {
        await setup();
        await send(whiteListed[0], web3.toWei(0.5), false);
        await send(whiteListed[1], web3.toWei(11), false);
    });
});
