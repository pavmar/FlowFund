// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LendingContract {
    mapping(address => uint256) public balances; // Tracks lender balances
    mapping(address => uint256) public collateral; // Tracks collateral submitted by borrowers
    mapping(address => uint256) public borrowed; // Tracks the amount borrowed by each user
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function submitCollateral() external payable {
        require(msg.value > 0, "Must send ETH as collateral");
        collateral[msg.sender] += msg.value;
    }

    function lend() external payable {
        require(msg.value > 0, "Must send ETH to lend");
        balances[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) external {
        uint256 maxBorrow = (collateral[msg.sender] * 50) / 100; // 50% of collateral
        require(amount <= maxBorrow, "Cannot borrow more than 50% of collateral");
        require(address(this).balance >= amount, "Insufficient funds in contract");
        borrowed[msg.sender] += amount; // Track the borrowed amount
        payable(msg.sender).transfer(amount);
    }

    function repay() external payable {
        require(msg.value > 0, "Must send ETH to repay");
        require(borrowed[msg.sender] >= msg.value, "Repay amount exceeds borrowed amount");

        borrowed[msg.sender] -= msg.value; // Reduce the borrowed amount
    }

    function withdrawLenderFunds(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient lender balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Allow the contract to accept plain ETH transfers
    receive() external payable {}
}
