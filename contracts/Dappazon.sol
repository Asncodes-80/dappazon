// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Dappazon {
    string public name;
    address public owner;

    constructor() {
        name = "Dappazon";
        owner = msg.sender;
    }
}
