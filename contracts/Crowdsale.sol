// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    // store token price in contract
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

    // save local token variables from created token contract to state 
    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
    }

    modifier onlyOwner() {
        // verifies deployer as only authorized finalizer
        // use reason string to add error messages
        require(msg.sender == owner, 'caller must be owner');
        
        // _; identifies the function body
        // reads - execute this(require(msg.sender == owner, 'caller must be owner');), before moving onto function body
            // eg body of Finalize:
            // require(token.transfer(owner, token.balanceOf(address(this))));
            // uint256 value = address(this).balance;
            // (bool sent, ) = owner.call{value: value}("");
            // require(sent);
            // emit Finalize(tokensSold, value);
        _;
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

    function setPrice(uint256 _price) public onlyOwner() {
        price = _price;
    }

    function finalize() public onlyOwner {
        // Send remaining tokens to crowdsale creator
        // check remaining token balance
        require(token.transfer(owner, token.balanceOf(address(this))));

        // Send ETH to crowdsale creator
        // get contract balance
        uint256 value = address(this).balance;
        // .call - low level function that let's you send a msg inside tx to another account
        // .call accepts metadata eg. {value: value}
        // call returns bool sent & bytes data
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
}
