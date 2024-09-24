// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// allows you to log messages to the console
// for debugging purposes
import "hardhat/console.sol";

contract Whitelist {
    address public owner;

    // mapping the address for boolean
    mapping(address => bool) whitelist;

    constructor() {
        owner = msg.sender;
    }

    // modifier requiring the user to be whitelisted to mint
    modifier onlyOwner() {
    require(msg.sender == owner, 'caller must be owner');
    _;
    }

    event addedToWhitelist(
        address indexed account
    );
    event removeFromWhitelist(
        address indexed account
    );

    // Add/remove accounts to whitelist
    function add(address _address) public onlyOwner returns (bool success)
    {
        whitelist[_address] = true;
        emit addedToWhitelist(_address);
        return true;
    }

    function remove(address _address) public onlyOwner {
        whitelist[_address] = false;
        emit removeFromWhitelist(_address);
    }

    // Check to see if address is whitelisted 
    function isWhitelisted(address _address) public view returns(bool) {
        return whitelist[_address];
    }
}
