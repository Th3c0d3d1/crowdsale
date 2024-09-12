import { useState } from "react";
import { ethers } from "ethers";
import { Form, Button, Col, Row, Spinner } from "react-bootstrap";

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {

    const [amount, setAmount] = useState('0')
    const [isWaiting, setIsWaiting] = useState(false)

    const buyHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        // Get current user
        const signer = await provider.getSigner()

        try{
            // Calculate required ETH to buy tokens
            const value = ethers.utils.parseUnits((amount * price).toString(), 'ether')
            // Format the amount passed in
            // 1000 = 1000000000000000000000 (18 zeros past the decimal)
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')

            const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value })
            await transaction.wait()
        } catch{
            window.alert('User rejected or transaction reverted')
        }

        // Refreshes the page after purchase to reflect in UI
        setIsLoading(true)
    }

    return(
        <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control type="number" placeholder="Enter Amount" onChange={(e) => setAmount(e.target.value)} />
                </Col>
                <Col className="text-center">
                {isWaiting ? (
                    <Spinner animation="border" />
                ): (
                    <Button variant="primary" type="Submit" style={{width: '100%'}} >
                        Buy Tokens
                    </Button>
                )}
                </Col>
            </Form.Group>
        </Form>
    )
} 

export default Buy;