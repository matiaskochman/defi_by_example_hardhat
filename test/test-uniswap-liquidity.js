const { network, ethers } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { WETH, DAI,WETH_KOVAN, DAI_KOVAN, WETH_WHALE_KOVAN, DAI_WHALE_KOVAN, DAI_WHALE_KOVAN_1 } = require("./config");

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
  const TOKEN_B_WHALE_1 = DAI_WHALE_KOVAN_1;

  let testUniswapLiquidity;
  let testUniswap;
  let token_weth;
  let token_dai;


  beforeEach(async () => {
    [CALLER, addr2, addr3, addr4, _] = await ethers.getSigners();

    // resetting  
    await reset({
      jsonRpcUrl: process.env.alchemy_api_KOVAN,
      blockNumber: 29133779,
    });



    console.log(`TOKEN_A: ${TOKEN_A}`);
    console.log(`TOKEN_B: ${TOKEN_B}`);


    token_weth = await ethers.getContractAt('IERC20', TOKEN_A);
    token_dai = await ethers.getContractAt('IERC20', TOKEN_B);

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
    let token_b_whale_signer_1 =  await impersonate(TOKEN_B_WHALE_1);

    let balance_weth = await token_weth.balanceOf(TOKEN_A_WHALE);
    
    console.log(`TOKEN_A_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_weth, 18)}`);
 
    let balance_dai = await token_dai.balanceOf(TOKEN_B_WHALE);
    
    console.log(`TOKEN_B_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    let ethbalance = await ethers.provider.getBalance(TOKEN_B_WHALE);
    console.log(`whale a eth balance: ${ethers.utils.formatUnits(ethbalance, 18)}`);
    await CALLER.sendTransaction({
      to: TOKEN_B_WHALE,
      value: ethers.utils.parseEther("10")
    })
    ethbalance = await ethers.provider.getBalance(TOKEN_B_WHALE);
    console.log(`whale b eth balance: ${ethers.utils.formatUnits(ethbalance, 18)}`);

    await CALLER.sendTransaction({
      to: TOKEN_B_WHALE_1,
      value: ethers.utils.parseEther("10")
    })
    ethbalance = await ethers.provider.getBalance(TOKEN_B_WHALE_1);
    console.log(`whale b_1 eth balance: ${ethers.utils.formatUnits(ethbalance, 18)}`);

    let transferTx1 = await token_weth.connect(token_a_whale_signer).transfer(CALLER.address, ethers.utils.parseUnits('10', 'ether'));
    let transferTx2 = await token_dai.connect(token_b_whale_signer_1).transfer(CALLER.address, ethers.utils.parseUnits('79000', 'ether'));
    let transferTx3 = await token_dai.connect(token_b_whale_signer_1).transfer(addr2.address, ethers.utils.parseUnits('100000', 'ether'));

    balance_dai = await token_dai.balanceOf(TOKEN_B_WHALE);
    
    console.log(`TOKEN_B_WHALE balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    balance_weth = await token_weth.balanceOf(TOKEN_A_WHALE);
    
    console.log(`TOKEN_A_WHALE balance of balance_weth: ${ethers.utils.formatUnits(balance_weth, 18)}`);

    balance_weth = await token_weth.balanceOf(CALLER.address);
    
    console.log(`CALLER balance of balance_weth: ${ethers.utils.formatUnits(balance_weth, 18)}`);

    balance_dai = await token_dai.balanceOf(CALLER.address);
    
    console.log(`CALLER balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);

    balance_dai = await token_dai.balanceOf(addr2.address);
    
    console.log(`addr2 balance of balance_dai: ${ethers.utils.formatUnits(balance_dai, 18)}`);
    
  });

  it("add liquidity, make a swap and and remove liquidity in KOVAN", async () => {
    await token_weth.approve(testUniswapLiquidity.address, ethers.utils.parseUnits('1000', 'ether'), { from: CALLER.address });
    await token_dai.approve(testUniswapLiquidity.address, ethers.utils.parseUnits('2600', 'ether'), { from: CALLER.address });

    let tx = await testUniswapLiquidity.addLiquidity(
      token_dai.address,
      token_weth.address,
      ethers.utils.parseUnits('2000', 'ether'),
      ethers.utils.parseUnits('10', 'ether'),
      {
        from: CALLER.address,
      }
    );
    console.log("=== add liquidity ===");


    let AMOUNT_IN = ethers.utils.parseUnits('100000', 'ether');
    let TO = addr2.address;
    await token_dai.connect(addr2).approve(testUniswap.address, AMOUNT_IN, { from: TO });
    console.log('approve testUniswap');

    // swapping dai for weth
    await testUniswap.connect(addr2).swap(
      token_dai.address,
      token_weth.address,
      AMOUNT_IN,
      0,
      TO,
      {
        from: TO,
      }
    );

    console.log(`in ${ethers.utils.formatUnits(AMOUNT_IN, 18)}`);
    console.log(`token_weth out ${ethers.utils.formatUnits(await token_weth.balanceOf(TO), 18)}`);

    tx = await testUniswapLiquidity.removeLiquidity(token_dai.address, token_weth.address, {
      from: CALLER.address,
    });
  });

  it("swap DAI for WETH in KOVAN", async () => {
    let AMOUNT_IN = ethers.utils.parseUnits('79000', 'ether');
    let TO = CALLER.address;
    await token_dai.approve(testUniswap.address, AMOUNT_IN, { from: CALLER.address });

    console.log('approve testUniswap');

    
    await testUniswap.swap(
      token_dai.address,
      token_weth.address,      
      AMOUNT_IN,
      0,
      TO,
      {
        from: TO,
      }
    );

    console.log(`in ${ethers.utils.formatUnits(AMOUNT_IN, 18)}`);
    console.log(`token_weth out ${ethers.utils.formatUnits(await token_weth.balanceOf(TO), 18)}`);
  });

});
