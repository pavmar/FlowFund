// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LendingContract {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function lend() external payable {
        require(msg.value > 0, "Must send ETH to lend");
        balances[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) external {
        require(address(this).balance >= amount, "Insufficient funds in contract");
        payable(msg.sender).transfer(amount);
    }

    function repay() external payable {
        require(msg.value > 0, "Must send ETH to repay");
        require(balances[msg.sender] >= msg.value, "Repay amount exceeds balance");
        balances[msg.sender] -= msg.value;
    }

    // Allow the contract to accept plain ETH transfers
    receive() external payable {}
}
