// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    // store token price in contract
    uint256 public price;

    // save local token variables from created token contract to state 
    constructor(
        Token _token,
        uint256 _price
    ) {
        token = _token;
        price = _price;
    }

    // Payable stores eth in crowdsale contract in exchange for tokens
    function buyTokens(uint256 _amount) public payable {
        token.transfer(msg.sender, _amount);
    }
}
