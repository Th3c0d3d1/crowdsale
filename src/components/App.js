import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"
import { ethers } from "ethers"

// Components
import Navigation from "./Nav.js"
import Info from "./Info.js"
import config from "../config.json"
import Loading from "./Loading.js"
import Progress from "./Progress.js"

// ABIs
import TOKEN_ABI from "../abis/Token.json"
import CROWDSALE_ABI from "../abis/Crowdsale.json"

function App() {
    // account -> Variable of current account value
    // setAccount('0x0...') -> Function to update account value
    // null -> Default value
    const [provider, SetProvider] = useState(null)
    const [account, setAccount] = useState(null)

    const [accountBalance, setAccountBalance] = useState(0)
    const [price, setPrice] = useState(0)
    const [maxTokens, setMaxTokens] = useState(0)
    const [tokensSold, setTokensSold] = useState(0)


    const [crowdsale, setCrowdsale] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    
    // window.ethereum is fetched to wire to app
    const loadBlockchainData = async () => {
        // Initiate provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        SetProvider(provider)

        // Fetch Chain ID
        const { chainId } = await provider.getNetwork()

        // Initiate Contracts
        const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
        console.log(token.address)
        const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
        setCrowdsale(crowdsale)
        
        // Set the MMK accounts to the accounts variable
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = await ethers.utils.getAddress(accounts[0])
        // Add account to state
        setAccount(account)

        // Fetch account balance
        // ethers.utils.formatUnits() converts bignumber to readable number
        const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
        setAccountBalance(accountBalance)

        const price = ethers.utils.formatUnits(await crowdsale.price(), 18)
        setPrice(price)

        const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18)
        setMaxTokens(maxTokens)

        const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18)
        setTokensSold(tokensSold)

        // Keeps page from constantly loading
        // Tells loadBlockchainData loading is done
        setIsLoading(false)
    }

    useEffect(() => {
        if(isLoading) {
            loadBlockchainData()
        }
    }, [isLoading]);

    return(
        <Container>
            <Navigation />

            <h1 className="text-center">Introducing Next Gen Token!</h1>

            {isLoading ? (
                <Loading />
            ) : (
            <>
                <p className="text-center"><strong>Current Price:</strong> {price} ETH</p>
                <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
            </>
            )}

            <hr />
            {/* Checks for availability of accounts */}
            {account && (
                <Info account={account} accountBalance={accountBalance} />
            )}
            {/* Read account from state */}
        </Container>
    )
}

export default App;