const { network, ethers } = require("hardhat");
const { expect, assert } = require("chai");
require('dotenv').config();


const impersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });
  return ethers.provider.getSigner(address);
};

const reset = async (forking) => {
  const params = forking ? [{ forking }] : [];
  await network.provider.request({
    method: 'hardhat_reset',
    params,
  });
};

const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require("./config")

// const IERC20 = artifacts.require("IERC20")
// const TestAaveFlashLoan = artifacts.require("TestAaveFlashLoan")

describe("TestAaveFlashLoan", () => {
  const WHALE = USDC_WHALE
  const TOKEN_BORROW = USDC
  const DECIMALS = 6
  const FUND_AMOUNT = pow(10, DECIMALS).mul(new BN(2000000)) 
  const BORROW_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000))

  const ADDRESS_PROVIDER = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"

  let testAaveFlashLoan
  let token
  beforeEach(async () => {
    [CALLER, addr2, addr3, addr4, _] = await ethers.getSigners();

    // resetting  
    await reset({
      jsonRpcUrl: process.env.alchemy_api,
      blockNumber: 13960010,
    });

    token = await ethers.getContractAt('IERC20', TOKEN_BORROW);

    const TestAaveFlashLoan = await ethers.getContractFactory("TestAaveFlashLoan");
    testAaveFlashLoan = await TestAaveFlashLoan.deploy(ADDRESS_PROVIDER);    
    await testAaveFlashLoan.deployed();


    // token = await IERC20.at(TOKEN_BORROW)
    // testAaveFlashLoan = await TestAaveFlashLoan.new(ADDRESS_PROVIDER)

    // await sendEther(web3, accounts[0], WHALE, 1)
    await CALLER.sendTransaction({
        to: WHALE,
        value: ethers.utils.parseEther("1")
      })

    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE)

    console.log('tema 1')
    assert(bal.gte(String(FUND_AMOUNT)), "balance < FUND")

    console.log('tema 2')
    let token_whale_signer =  await impersonate(WHALE);

    console.log('tema 3')
    await token.connect(token_whale_signer).transfer(testAaveFlashLoan.address, String(FUND_AMOUNT), {
      from: WHALE,
    })
    console.log('tema 4')
  })

  it("flash loan", async () => {
    
    let token_whale_signer =  await impersonate(WHALE);
    const tx = await testAaveFlashLoan.connect(token_whale_signer).testFlashLoan(token.address, String(BORROW_AMOUNT), {
      from: WHALE,
    })
    // for (const log of tx.logs) {
    //   console.log(log.args.message, log.args.val.toString())
    // }
  })
})
