// Set up an ethers contract, representing our deployed Box instance
const address = '0x63e6DDE6763C3466C7b45Be880f7eE5dC2ca3E25';
const LendingBorrowing = await ethers.getContractFactory('LendingBorrowing');
console.log('LendingBorrowing address:', LendingBorrowing.address);
const box = LendingBorrowing.attach(address);
console.log('Box address:', box.address);