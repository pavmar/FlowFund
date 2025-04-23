const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingContract", function () {
  let lendingContract;
  let owner, lender, borrower, addr1;

  beforeEach(async function () {
    // Get signers
    [owner, lender, borrower, addr1] = await ethers.getSigners();

    // Deploy the LendingContract
    const LendingContract = await ethers.getContractFactory("LendingContract");
    lendingContract = await LendingContract.deploy();
    await lendingContract.waitForDeployment();

    console.log("LendingContract deployed at:", lendingContract.target);
  });

  it("should allow a user to submit collateral", async function () {
    const collateralAmount = ethers.parseEther("1"); // 1 ETH

    // Borrower submits collateral
    const borrowerContract = lendingContract.connect(borrower);
    await borrowerContract.submitCollateral({ value: collateralAmount });

    // Check the collateral balance
    const collateralBalance = await lendingContract.collateral(borrower.address);
    expect(collateralBalance).to.equal(collateralAmount);
  });

  it("should allow a user to borrow up to 50% of their collateral", async function () {
    const collateralAmount = ethers.parseEther("2"); // 2 ETH
    const borrowAmount = ethers.parseEther("1"); // 50% of collateral

    // Borrower submits collateral
    const borrowerContract = lendingContract.connect(borrower);
    await borrowerContract.submitCollateral({ value: collateralAmount });

    // Borrower borrows ETH
    await borrowerContract.borrow(borrowAmount);

    // Check the contract's balance after borrowing
    const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    console.log("Contract balance after borrowing:", ethers.formatEther(contractBalance), "ETH");

    // Check the borrower's collateral (should remain unchanged)
    const collateralBalance = await lendingContract.collateral(borrower.address);
    expect(collateralBalance).to.equal(collateralAmount);
  });

  it("should revert if a user tries to borrow more than 50% of their collateral", async function () {
    const collateralAmount = ethers.parseEther("2"); // 2 ETH
    const excessiveBorrowAmount = ethers.parseEther("1.1"); // More than 50% of collateral

    // Borrower submits collateral
    const borrowerContract = lendingContract.connect(borrower);
    await borrowerContract.submitCollateral({ value: collateralAmount });

    // Borrower tries to borrow more than 50% of their collateral
    await expect(
      borrowerContract.borrow(excessiveBorrowAmount)
    ).to.be.revertedWith("Cannot borrow more than 50% of collateral");
  });

  it("should allow a user to lend ETH", async function () {
    const lendAmount = ethers.parseEther("1"); // 1 ETH

    // Lender lends ETH
    const lenderContract = lendingContract.connect(lender);
    await lenderContract.lend({ value: lendAmount });

    // Check the lender's balance in the contract
    const lenderBalance = await lendingContract.balances(lender.address);
    expect(lenderBalance).to.equal(lendAmount);

    // Check the contract's balance
    const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    expect(contractBalance).to.equal(lendAmount);
  });

  it("should allow a user to repay ETH and update their borrowed amount", async function () {
    // Borrower submits collateral
    const collateralAmount = ethers.parseEther("2"); // 2 ETH
    const borrowAmount = ethers.parseEther("1"); // 50% of collateral
    const repayAmount = ethers.parseEther("0.5"); // 0.5 ETH

    const borrowerContract = lendingContract.connect(borrower);
    await borrowerContract.submitCollateral({ value: collateralAmount });
    await borrowerContract.borrow(borrowAmount);

    // Borrower repays part of the borrowed ETH
    await borrowerContract.repay({ value: repayAmount });

    // Check the borrower's borrowed amount
    const borrowedAmount = await lendingContract.borrowed(borrower.address);
    expect(borrowedAmount).to.equal(ethers.parseEther("0.5"));

    // Check the borrower's collateral (should remain unchanged)
    const collateralBalance = await lendingContract.collateral(borrower.address);
    expect(collateralBalance).to.equal(collateralAmount);

    // Check the contract's balance after repayment
    const contractBalance = await ethers.provider.getBalance(lendingContract.target);
    console.log("Contract balance after repayment:", ethers.formatEther(contractBalance), "ETH");
  });

  it("should revert if trying to borrow without submitting collateral", async function () {
    const borrowAmount = ethers.parseEther("1"); // 1 ETH

    // Borrower tries to borrow without submitting collateral
    const borrowerContract = lendingContract.connect(borrower);
    await expect(
      borrowerContract.borrow(borrowAmount)
    ).to.be.revertedWith("Cannot borrow more than 50% of collateral");
  });

  it("should revert if trying to lend 0 ETH", async function () {
    // Lender tries to lend 0 ETH
    const lenderContract = lendingContract.connect(lender);
    await expect(
      lenderContract.lend({ value: 0 })
    ).to.be.revertedWith("Must send ETH to lend");
  });

  it("should revert if trying to repay 0 ETH", async function () {
    // Borrower tries to repay 0 ETH
    const borrowerContract = lendingContract.connect(borrower);
    await expect(
      borrowerContract.repay({ value: 0 })
    ).to.be.revertedWith("Must send ETH to repay");
  });
});