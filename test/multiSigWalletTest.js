const { expect } = require("chai");
const { ethers } = require("hardhat");

let multiSigWallet
let testContract
describe("MultiSigWallet", function () {

  before(async ()=> {
    [deployer, usr1, usr2, usr3, usr4, usr5,receiver, _] = await ethers.getSigners();
    const MultiSigWallet1 = await ethers.getContractFactory("MultiSigWallet1");
    multiSigWallet = await MultiSigWallet1.deploy([usr1.address, usr2.address, usr3.address], 2);
    await multiSigWallet.deployed();

    const TestContract = await ethers.getContractFactory("TestContract");
    testContract = await TestContract.deploy();
    await testContract.deployed();
  })

  it("Simple transaction", async function () {
    await deployer.sendTransaction({
      to: multiSigWallet.address,
      value: ethers.utils.parseEther("10")
    })

    await multiSigWallet.connect(usr1).submitTransaction(receiver.address, ethers.utils.parseEther("2"),0x0);

    await multiSigWallet.connect(usr2).confirmTransaction(0)
    await multiSigWallet.connect(usr3).confirmTransaction(0)

    await multiSigWallet.connect(usr1).executeSimpleTransaction(0)
  });

  it("Transactions that executes code in another contract", async () => {
    let data = await testContract.i()
    console.log("testContract i value: " , data)

    await deployer.sendTransaction({
      to: multiSigWallet.address,
      value: ethers.utils.parseEther("1")
    })

    await multiSigWallet.connect(usr1).submitTransaction(testContract.address, ethers.utils.parseEther("1"), data);

    const provider = ethers.getDefaultProvider();

    const balance = await provider.getBalance(testContract.address);
    console.log("testContract balance: ", balance)

    await multiSigWallet.connect(usr2).confirmTransaction(1)
    await multiSigWallet.connect(usr3).confirmTransaction(1)

    // let t0 = await multiSigWallet.connect(usr1).getTransaction(0)
    // let t1 = await multiSigWallet.connect(usr1).getTransaction(1)

    // console.log("transaction: ", t0);
    // console.log("transaction: ", t1);

    await multiSigWallet.connect(usr1).executeTransactionOnContract(1)
    data = await testContract.i()
    console.log("testContract i variable: " , data)
  })
});
