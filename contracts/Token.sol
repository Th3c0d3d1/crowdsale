// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// allows you to log messages to the console
// for debugging purposes
import "hardhat/console.sol";

contract Token {
    // "public" visibility accesses value from outside the contract
    // state variables are stored on the blockchain
    string public name;
    string public symbol;
    uint public decimals = 18;
    uint public totalSupply;

    // Track balances for each address
    // mapping is a key-value store
    // key is an address, value is account balance
    // balanceOf is a state variable
    // database stored on the blockchain
    mapping(address => uint256) public balanceOf;

    // Allowance mapping
    // 2D mapping
    // 1st key is the owner of the tokens
    // 2nd key is all potential spenders
    // value is the amount of tokens that spender is allowed to spend
    mapping(address => mapping(address => uint256)) public allowance;

    // Send tokens from one address to another
    // Indexed keyword allows you to filter events
    // Arguments are indexed in the event log
    event Transfer(
        address indexed from, 
        address indexed to, 
        uint256 value
        );

    event Approval(
        address indexed owner, 
        address indexed spender, 
        uint256 value
    );

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint _totalSupply
        ){
        // arg (local variables) passed into state variable @ deployment
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);

        // msg.sender is the address that deployed the contract
        // msg is a global variable
        // [msg.sender] read & write to balanceOf mapping
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint _value) 
        public 
        returns (bool success) 
    {
        // Require that the sender has enough tokens
        // Throw an error if the condition is not met
        require(balanceOf[msg.sender] >= _value, 'Not enough tokens');

        _transfer(msg.sender, _to, _value);

        return true;
    }

    // Internal function to transfer tokens
    function _transfer(
        address _from,
        address _to,
        uint _value
    ) internal {
        require(balanceOf[_from] >= _value, 'Not enough tokens');
        require(_to != address(0));

        // Deduct tokens from sender
        balanceOf[_from] -= _value;

        // Credit the recipient
        balanceOf[_to] += _value;

        // Emit the event
        emit Transfer(_from, _to, _value);
    }

    // Approve tokens
    function approve(address _spender, uint _value) 
    public 
    returns (bool success) 
    {
        require(_spender != address(0));
        // Allowance mapping
        allowance[msg.sender][_spender] = _value;

        // Emit the event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint _value
    ) 
    public 
    returns (bool success)
    {
    // check approval
    // require that the owner has enough tokens
    require(_value <= balanceOf[_from], 'Not enough tokens');
    // require that the spender has allowed msg.sender to spend _value tokens
    require(_value <= allowance[_from][msg.sender], 'Allowance exceeded');
    
    // reset the allowance
    // updates the allowance of the msg.sender mapping
    allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

    // spend tokens on behalf of the owner
    _transfer(_from, _to, _value);

    return true;
    }
}
