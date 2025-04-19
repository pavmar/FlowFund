const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingContract", function () {
  let lendingContract;
  let owner, lender, borrower;

  beforeEach(async function () {
    // Get signers
    [owner, lender, borrower] = await ethers.getSigners();

    // Deploy the LendingContract
    const LendingContract = await ethers.getContractFactory("LendingContract");
    lendingContract = await LendingContract.deploy();
    await lendingContract.waitForDeployment();

    console.log("LendingContract deployed at:", lendingContract.target);
    // Send 500 ETH to the contract
    // const initialFunding = ethers.parseEther("500"); // 500 ETH
    // await owner.sendTransaction({
    //   to: lendingContract.target,
    //   value: initialFunding,
    // });

    // // Verify the contract's balance
    // const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    // console.log("Contract balance after funding:", ethers.formatEther(contractBalance), "ETH");
    // expect(contractBalance).to.equal(initialFunding);
  
  });

  it("should allow a user to lend ETH", async function () {
    const lendAmount = ethers.parseEther("501.0"); // 1 ETH

    // Connect the contract to the lender and send ETH
    const lenderContract = lendingContract.connect(lender);
    await lenderContract.lend({ value: lendAmount });

    // Check the lender's balance in the contract
    const lenderBalance = await lendingContract.balances(lender.address);
    expect(lenderBalance).to.equal(lendAmount);

    // Check the contract's balance
    const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    expect(contractBalance).to.equal(lendAmount);
  });

  it("should allow a user to borrow ETH if funds are available", async function () {
    const lendAmount = ethers.parseEther("2"); // 2 ETH
    const borrowAmount = ethers.parseEther("1"); // 1 ETH

    // Connect the contract to the lender and send ETH
    const lenderContract = lendingContract.connect(lender);
    await lenderContract.lend({ value: lendAmount });

    // Debug: Check contract balance before borrowing
    const contractBalanceBefore = await ethers.provider.getBalance(lendingContract.target);
    console.log("Contract balance before borrowing:", ethers.formatEther(contractBalanceBefore), "ETH");

    // Connect the contract to the borrower and borrow ETH
    const borrowerContract = lendingContract.connect(borrower);
    await borrowerContract.borrow(borrowAmount);

    // Check the contract's balance after borrowing
    const contractBalanceAfter = await ethers.provider.getBalance(lendingContract.target);
    console.log("Contract balance after borrowing:", ethers.formatEther(contractBalanceAfter), "ETH");
    expect(contractBalanceAfter).to.equal(lendAmount - borrowAmount);

    // Check the borrower's balance (should increase by borrowAmount)
    const borrowerBalance = await ethers.provider.getBalance(borrower.address);
    console.log("Borrower's balance after borrowing:", ethers.formatEther(borrowerBalance), "ETH");
  });

  it("should revert if trying to borrow more than available", async function () {
    const lendAmount = ethers.parseEther("2.0"); // 1 ETH
    const excessiveBorrow = ethers.parseEther("3.0"); // 2 ETH (more than available)

    // Connect the contract to the lender and send ETH
    const lenderContract = lendingContract.connect(lender);
    await lenderContract.lend({ value: lendAmount });

    // Debug: Check contract balance before excessive borrowing
    const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    console.log("Contract balance before excessive borrowing:", ethers.formatEther(contractBalance), "ETH");

    // Connect the contract to the borrower and try to borrow more than available
    const borrowerContract = lendingContract.connect(borrower);
    await expect(
      borrowerContract.borrow(excessiveBorrow)
    ).to.be.revertedWith("Insufficient funds in contract");
  });

  it("should revert if trying to lend 0 ETH", async function () {
    // Connect the contract to the lender and try to lend 0 ETH
    const lenderContract = lendingContract.connect(lender);
    await expect(
      lenderContract.lend({ value: 0 })
    ).to.be.revertedWith("Must send ETH to lend");
  });
});