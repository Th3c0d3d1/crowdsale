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

        // Deploy the crowdsale
        // Declare price of token (ether(1))
        // 1 eth = 1 NXG 
        crowdsale = await Crowdsale.deploy(token.address, ether(1))

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
                let transaction = await crowdsale.connect(user1).buyTokens(amount)
                let result = await transaction.wait()
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
        })
    })
})
