const hre = require("hardhat");

async function main() {
    const NAME = 'Insert Token Name'
    const SYMBOL = 'Insert Token Symbol'
    const MAX_SUPPLY = 'Insert Token Supply'
    const PRICE = ethers.utils.parseUnits('Insert Token price(ETH)', 'ether')

    // Deployment token
    const Token = await  hre.ethers.getContractFactory('Token')
    let token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)

    await token.deployed()
    // \n adds a new line in terminal
    console.log(`Token deployed to: ${token.address}\n`)

    // Deploy crowdsale
    const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
    // Args come from test(address, price, max supply)
    let crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))

    await crowdsale.deployed()
    console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

    // Send tokens to crowdsale
    const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
    await transaction.wait()

    console.log(`Tokens transferred to crowdsale\n`)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
