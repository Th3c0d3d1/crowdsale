import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"
import { ethers } from "ethers"

// Components
import Navigation from "./Nav.js"
import Info from "./Info.js"


function App() {
    // account -> Variable of current account value
    // setAccount('0x0...') -> Function to update account value
    // null -> Default value
    const [account, setAccount] = useState(null)

    // window.ethereum is fetched to wire to app
    const loadBlockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        
        // Set the MMK accounts to the accounts variable
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = await ethers.utils.getAddress(accounts[0])

        // Add account to state
        setAccount(account)
    }

    

    useEffect(() => {
        loadBlockchainData()
    });

    return(
        <Container>
            <Navigation />
            <hr />
            {/* Checks for availability of accounts */}
            {account && (
                <Info account={account}/>
            )}
            {/* Read account from state */}
        </Container>
    )
}

export default App;