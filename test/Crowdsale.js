const { ethers } = require('hardhat')
const { expect } = require('chai')

// Tokens helper
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
// Ether helper uses tokens helper
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

        // Deploy tokens
        token = await Token.deploy('Next Gen', 'NXG', '1000000')

        // Configure accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        // Deploy the ICO contract
        // Declare price of token (ether(1))
        // 1 ETH = 1 NXG 
        // (token.address, ether(1), '1000000') = constructor variables(token address, price, maxSupply)
        crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000')

        // Send tokens to crowdsale
        // transaction is when the token deployer transfers token supply to the crowdsale address
        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })

    describe('Deployment', () => {

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
    })

    describe('Buying tokens', () => {
        let transaction,
            result
        // buy 10 test tokens
        let amount = tokens(10)

        describe('Success', () => {
            beforeEach(async () => {
                // transaction is when a crowdsale user buys a token amount
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})
                result = await transaction.wait()
            })

            it('transfers tokens', async () => {
                // check for balance change after transfer
                // expect the token balance of the crowdsale address to equal the token amount after tokens transfer (10 tokens (let amount = tokens(10)) in this test = 999990)
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
                // expect the balance of the crowdsale user to equal the amount of tokens transfered after test
                expect(await token.balanceOf(user1.address)).to.eq(amount)
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
            it('rejects isufficient ETH', async () => {
                // expect the connected crowdsale user purchase of 10 tokens using an ETH value of zero to be reverted
                await expect(crowdsale.connect(user1).buyTokens(tokens(10), {value: 0})).to.be.reverted
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
})
