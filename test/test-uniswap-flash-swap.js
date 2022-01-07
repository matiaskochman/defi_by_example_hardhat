
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

describe("TestUniswapFlashSwap", () => {
  const WHALE = USDC_WHALE
  const TOKEN_BORROW = USDC
  const DECIMALS = 6
  const FUND_AMOUNT = ethers.utils.parseUnits('10000000', 'mwei')
  const BORROW_AMOUNT = ethers.utils.parseUnits('1000000', 'mwei')

  let testUniswapFlashSwap
  let token
  beforeEach(async () => {
    [CALLER, addr2, addr3, addr4, _] = await ethers.getSigners();

    // resetting  
    await reset({
      jsonRpcUrl: process.env.alchemy_api,
      blockNumber: 13960010,
    });

    token = await ethers.getContractAt('IERC20', TOKEN_BORROW);

    const TestUniswapFlashSwap = await ethers.getContractFactory("TestUniswapFlashSwap");
    testUniswapFlashSwap = await TestUniswapFlashSwap.deploy();    
    await testUniswapFlashSwap.deployed();

    console.log(`whale address: ${WHALE}`)
    let ethbalance = await ethers.provider.getBalance(WHALE);
    console.log(`whale eth balance: ${ethbalance} `);
    await CALLER.sendTransaction({
        to: WHALE,
        value: ethers.utils.parseEther("1")
      })
  
      console.log('todo bien 4')


    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE)

    console.log(`FUND amount: ${ethers.utils.formatUnits(FUND_AMOUNT, 6)}`);
    console.log(`bal: ${ethers.utils.formatUnits(bal, 6)}`);

    assert(bal.gte(FUND_AMOUNT), "balance < FUND")

    let token_whale_signer =  await impersonate(WHALE);

    await token.connect(token_whale_signer).transfer(testUniswapFlashSwap.address, FUND_AMOUNT, {
      from: WHALE,
    })
  })

  it("flash swap", async () => {
    let token_whale_signer =  await impersonate(WHALE);
    const tx = await testUniswapFlashSwap.connect(token_whale_signer).testFlashSwap(token.address, BORROW_AMOUNT, {
      from: WHALE,
    })

    // for (const log of tx.logs) {
    //   console.log(log.args.message, log.args.val.toString())
    // }
  })
})
