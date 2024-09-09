// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    // store token price in contract
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    event Buy(uint256 amount, address buyer);

    // save local token variables from created token contract to state 
    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens
    ) {
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
    }

    // function to buy tokens by direct contract interaction
    // no user/website interaction
    // required to receive ETH
    // sets the price required to buy tokens
    receive() external payable{
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    // Payable stores eth in crowdsale contract in exchange for tokens
    function buyTokens(uint256 _amount) public payable {
        // Verify sufficient crypto to satisfy condition
        // msg.value checks ETH value sent by payable function by ICO user
        // (_amount / 1e18) * price) converts from wei
        require(msg.value == (_amount / 1e18) * price);
        // Require user balance to be greater than or equal to amount
        // (this) references the current contract
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount), 'failed to transfer tokens');

        // tracks the total number of tokens sold
        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }
}
