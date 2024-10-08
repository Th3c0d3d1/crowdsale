const { ethers } = require('hardhat')
const { expect } = require('chai')

// Helper functions
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ether = tokens

describe('Crowdsale', () => {
    let crowdsale,
        token,
        accounts,
        deployer,
        user1

    beforeEach(async () => {
        // Load Contracts
        const Crowdsale = await ethers.getContractFactory('Crowdsale')
        const Token = await ethers.getContractFactory('Token')
        const Whitelist = await ethers.getContractFactory('Whitelist')

        // Deploy tokens
        token = await Token.deploy('Next Gen', 'NXG', '1000000')

        // Deploy the whitelist contract
        whitelist = await Whitelist.deploy()

        // Deploy the ICO contract
        // Declare price of token (ether(1))
        // 1 ETH = 1 NXG 
        // (token.address, ether(1), '1000000') = constructor variables(token address, price, maxSupply)
        crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000')

        // Configure accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]
        nonWhitelistedUser = accounts[2]

        // Add deployer to the whitelist
        await crowdsale.add(deployer.address)
        // Add user1 to the whitelist
        await crowdsale.add(user1.address)

        // Verify deployer is on the whitelist
        expect(await crowdsale.isWhitelisted(deployer.address)).to.be.true
        // Verify user1 is on the whitelist
        expect(await crowdsale.isWhitelisted(user1.address)).to.be.true      

        // Send tokens to crowdsale
        // transaction is when the token deployer transfers token supply to the crowdsale address
        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })

    describe('Deployment', () => {
        describe('Success', () => {
            it('sends tokens to the crowdsale address', async () => {
                // verify crowdsale token balance
                // expect the balance of the crowdsale address to equal the initial supply
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(1000000))
            })

            it('returns the price', async () => {
                // Verify the token price
                // expect the crowdsale token price to equal 1 eth
                expect(await crowdsale.price()).to.eq(ether(1))
            })

            it('returns the token address', async () => {
                // verify token address
                // expect the the crowdsale token address to equal the token address
                expect(await crowdsale.token()).to.eq(token.address)
            })

            it('verifies owners whitelist status', async () => {
                // Verify owner is on the whitelist
                expect(await crowdsale.isWhitelisted(deployer.address)).to.be.true
            })

            it('checks owners right to add/del user from whitelist ', async () => {
                // Verify owner can add user to whitelist
                await crowdsale.add(user1.address)
                expect(await crowdsale.isWhitelisted(user1.address)).to.be.true

                // Verify owner can remove user from whitelist
                await crowdsale.remove(user1.address)
                expect(await crowdsale.isWhitelisted(user1.address)).to.be.false
            })
        })

        describe('Failure', () => {
            it('rejects non-owner from adding/deleting whitelist users', async () => {
                // expect the crowdsale contract to be reverted if a non-owner tries to add a user to the whitelist
                await expect(crowdsale.connect(user1).add(user1.address)).to.be.reverted

                // expect the crowdsale contract to be reverted if a non-owner tries to remove a user from the whitelist
                await expect(crowdsale.connect(user1).remove(user1.address)).to.be.reverted
            })
        })
    })

    describe('Buying tokens', () => {
        let transaction,
            result
        // buy 10 test tokens
        let amount = tokens(10)

        describe('Success', () => {
            beforeEach(async () => {
                // Verify user1 is on the whitelist
                expect(await crowdsale.isWhitelisted(user1.address)).to.be.true

                // Whitelisted crowdsale user buys a token amount
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})
                result = await transaction.wait()
            })

            it('transfers tokens of whitelisted user', async () => {
                // check for balance change after transfer
                // expect the token balance of the crowdsale address to equal the token amount after tokens transfer (10 tokens (let amount = tokens(10)) in this test = 999990)
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
                // expect the balance of the crowdsale user to equal the amount of tokens transfered after test
                expect(await token.balanceOf(user1.address)).to.eq(amount.toString())
            })

            it('updates contracts ether balance', async () => {
                // expect the ether balance of the crowdsale contract address to equal the amount transfered
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount)
            })

            it('updates tokensSold', async () => {
                expect (await crowdsale.tokensSold()).to.eq(amount)
            })

            it('emits a buy event', async () => {
                // ref hardhat chai matchers to assert an event emission
                // expect the transaction to emit a crowdsale buy event with an amount & the crowdsale user address argument
                await expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
            })
        })

        describe('Failure', () => {
            it('prevents non-whitelisted users from buying tokens', async () => {
                await expect(crowdsale.connect(nonWhitelistedUser).buyTokens(tokens('10'), { value: ether(10) }))
                .to.be.revertedWith('user must be whitelisted')
            })

            it('rejects isufficient ETH', async () => {
                // expect the connected crowdsale user purchase of 10 tokens using an ETH value of zero to be reverted
                await expect(crowdsale.connect(user1).buyTokens(tokens('10'), { value: ether(0) })).to.be.revertedWith('insufficient ETH')
            })
        })
    })

    describe('Sending ETH', () => {
        let transaction, result
        let amount = ether(10)

        describe('Success', () => {

            beforeEach(async () => {
                // transaction is sent directly form user to ICO contract for token purchase
                // conection of user to ICO address not necessary with sendTransaction
                transaction = await user1.sendTransaction({ to: crowdsale.address, value: amount })
                result = await transaction.wait()
            })

            it('updates contracts ether balance', async () => {
                // expect the ether balance of the crowdsale contract address to equal the amount transfered
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount)
            })

            it('updates user token balance', async () => {
                expect(await token.balanceOf(user1.address)).to.eq(amount)
            })
        })
    })

    describe('Updating Price', async () => {
        let transaction, result
        let price = ether(2)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(deployer).setPrice(price)
                result = await transaction.wait()
            })

            it('updates the price', async () => {
                expect(await crowdsale.price()).to.eq(price)
            })
        })

        describe('Failure', () => {
            it('prevents non-owner from updating price', async () => {
                await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
            })
        })
    })

    describe('Finalizing Sale', () => {
        let transaction, result
        let amount = tokens(10)
        let value = ether(10)

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: value})
                result = await transaction.wait()

                transaction = await crowdsale.connect(deployer).finalize()
                result = await transaction.wait()
            })

            it('transfers remaining tokens to owner', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.eq(0)
                expect(await token.balanceOf(deployer.address)).to.eq(tokens(999990))
            })

            it('transferrs ETH balance to owner', async () => {
                expect (await ethers.provider.getBalance(crowdsale.address)).to.eq(0)
            })

            it('emits finalize event', async () => {
                await expect(transaction).to.emit(crowdsale, "Finalize").withArgs(amount, value)
            })
        })

        describe('Failure', () => {
            it('prevents non-owner from finalizing', async () => {
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
            })
        })
    })
})
