// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/Uniswap.sol";

contract TestUniswapLiquidity {
  address private constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
  address private constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  event Log(string message, uint val);

  function addLiquidity(
    address _token_dai,
    address _token_weth,
    uint _amountB,
    uint _amountA
  ) external {
    

    IERC20(_token_weth).transferFrom(msg.sender, address(this), _amountA);
    IERC20(_token_dai).transferFrom(msg.sender, address(this), _amountB);

    IERC20(_token_weth).approve(ROUTER, _amountA);
    IERC20(_token_dai).approve(ROUTER, _amountB);

    (uint amountB, uint amountA, uint liquidity) =
      IUniswapV2Router(ROUTER).addLiquidity(
        _token_dai,
        _token_weth,
        _amountB,
        _amountA,
        1,
        1,
        address(this),
        block.timestamp
      );

    console.log("added amount weth", (amountA));
    console.log("added amount dai", (amountB));
    console.log("liquidity", (liquidity));
    emit Log("amountA", amountA);
    emit Log("amountB", amountB);
    emit Log("liquidity", liquidity);
  }

  function removeLiquidity(address _token_weth, address _token_dai) external {
    address pair = IUniswapV2Factory(FACTORY).getPair(_token_weth, _token_dai);

    uint liquidity = IERC20(pair).balanceOf(address(this));
    IERC20(pair).approve(ROUTER, liquidity);

    (uint amountA, uint amountB) =
      IUniswapV2Router(ROUTER).removeLiquidity(
        _token_dai,
        _token_weth,
        liquidity,
        1,
        1,
        address(this),
        block.timestamp
      );

    console.log("removed amount weth", amountA);
    console.log("removed amount dai", amountB);

    emit Log("amountA", amountA);
    emit Log("amountB", amountB);
  }

  // function checkPair() external {
    
  // }
}
