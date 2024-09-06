const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

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
        crowdsale = await Crowdsale.deploy(token.address)

        // Send tokens to crowdsale
        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })

    describe('Deployment', () => {

        it('sends tokens to the crowdsale address', async () => {
            // verify crowdsale token balance
            expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(1000000))
        })

        it('returns the token address', async () => {
            // verify token address
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
                let transaction = await crowdsale.connect(user1).buyTokens(amount)
                let result = await transaction.wait()
            })

            it('transfers tokens', async () => {
                // check for balance change after transfer
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.eq(amount)
            })
        })
    })
})
