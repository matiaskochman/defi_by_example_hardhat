const { network, ethers } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { WETH, DAI,WETH_KOVAN, DAI_KOVAN, WETH_WHALE_KOVAN, DAI_WHALE_KOVAN } = require("./config");

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

describe("TestUniswapLiquidity", () => {
  const TOKEN_A = WETH_KOVAN;
  const TOKEN_A_WHALE = WETH_WHALE_KOVAN;
  const TOKEN_B = DAI_KOVAN;
  const TOKEN_B_WHALE = DAI_WHALE_KOVAN;

  let testUniswapLiquidity;
  let testUniswap;
  let tokenA;
  let tokenB;


  beforeEach(async () => {
    [CALLER, addr2, addr3, addr4, _] = await ethers.getSigners();

    // resetting  
    await reset({
      jsonRpcUrl: process.env.alchemy_api_KOVAN,
      blockNumber: 29133779,
    });



    console.log(`TOKEN_A: ${TOKEN_A}`);
    console.log(`TOKEN_B: ${TOKEN_B}`);


    tokenA = await ethers.getContractAt('IERC20', TOKEN_A);
    tokenB = await ethers.getContractAt('IERC20', TOKEN_B);

    const TestUniswapLiquidity = await ethers.getContractFactory("TestUniswapLiquidity");
    testUniswapLiquidity = await TestUniswapLiquidity.deploy();    
    await testUniswapLiquidity.deployed();

    
    const TestUniswap = await ethers.getContractFactory("TestUniswap");
    testUniswap = await TestUniswap.deploy();    
    await testUniswap.deployed();

    
    console.log(`TOKEN_A_WHALE: ${TOKEN_A_WHALE}`);
    console.log(`TOKEN_B_WHALE: ${TOKEN_B_WHALE}`);

    console.log(`CALLER: ${CALLER.address}`);

    let token_a_whale_signer =  await impersonate(TOKEN_A_WHALE);
    let token_b_whale_signer =  await impersonate(TOKEN_B_WHALE);

    let balance_weth = await tokenA.balanceOf(TOKEN_A_WHALE);
    
    console.log(`TOKEN_A_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_weth, 18)}`);
 
    let balance_dai = await tokenB.balanceOf(TOKEN_B_WHALE);
    
    console.log(`TOKEN_B_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    let ethbalance = await ethers.provider.getBalance(TOKEN_B_WHALE);
    console.log(`whale a eth balance: ${ethbalance}`);
    await CALLER.sendTransaction({
      to: TOKEN_B_WHALE,
      value: ethers.utils.parseEther("10")
    })
    ethbalance = await ethers.provider.getBalance(TOKEN_B_WHALE);
    console.log(`whale a eth balance: ${ethbalance}`);

    let transferTx1 = await tokenA.connect(token_a_whale_signer).transfer(CALLER.address, ethers.utils.parseUnits('1000', 'ether'));
    let transferTx2 = await tokenB.connect(token_b_whale_signer).transfer(CALLER.address, ethers.utils.parseUnits('2700', 'ether'));

    balance_dai = await tokenB.balanceOf(TOKEN_B_WHALE);
    
    console.log(`TOKEN_B_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    balance_weth = await tokenA.balanceOf(TOKEN_A_WHALE);
    
    console.log(`TOKEN_A_WHALE balance of balance_weth: ${ethers.utils.formatUnits(balance_weth, 18)}`);

    balance_weth = await tokenA.balanceOf(CALLER.address);
    
    console.log(`CALLER balance of balance_weth: ${ethers.utils.formatUnits(balance_weth, 18)}`);

    balance_dai = await tokenB.balanceOf(CALLER.address);
    
    console.log(`CALLER balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    
  });

  it("add liquidity and remove liquidity", async () => {
    await tokenA.approve(testUniswapLiquidity.address, ethers.utils.parseUnits('1000', 'ether'), { from: CALLER.address });
    await tokenB.approve(testUniswapLiquidity.address, ethers.utils.parseUnits('2600', 'ether'), { from: CALLER.address });

    let tx = await testUniswapLiquidity.addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseUnits('1', 'ether'),
      ethers.utils.parseUnits('2600', 'ether'),
      {
        from: CALLER.address,
      }
    );
    console.log("=== add liquidity ===");


    let AMOUNT_IN = 10;
    let TO = CALLER.address;
    await tokenB.approve(testUniswap.address, ethers.utils.parseUnits('1', 'ether'), { from: CALLER.address });
    console.log('approve testUniswap');

    await testUniswap.swap(
      tokenB.address,
      tokenA.address,
      ethers.utils.parseUnits('1', 'ether'),
      0,
      CALLER.address,
      {
        from: TO,
      }
    );



    tx = await testUniswapLiquidity.removeLiquidity(tokenA.address, tokenB.address, {
      from: CALLER.address,
    });
  });

  it.skip("should pass", async () => {
    let AMOUNT_IN = 100;
    let TO = CALLER.address;
    await tokenB.approve(testUniswap.address, AMOUNT_IN, { from: CALLER.address });

    console.log('approve testUniswap');

    
    await testUniswap.swap(
      tokenB.address,
      tokenA.address,      
      AMOUNT_IN,
      0,
      CALLER.address,
      {
        from: TO,
      }
    );

    console.log(`in ${AMOUNT_IN}`);
    console.log(`tokenB out ${await tokenB.balanceOf(TO)}`);
  });

});
