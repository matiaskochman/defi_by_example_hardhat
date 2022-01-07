# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```


npx hardhat node --fork https://eth-rinkeby.alchemyapi.io/v2/0N94y3GAH-7Cp8QtV2ox1cSDF4FsajtM --fork-block-number 13952000

npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/GZGUDF7BpG3bRSiRtMP84bdPQfa5wkdU --fork-block-number 9945361

npx hardhat node --fork https://eth-kovan.alchemyapi.io/v2/0N94y3GAH-7Cp8QtV2ox1cSDF4FsajtM --fork-block-number 29133779

Dai is available on the:

Ethereum mainnet at 0x6B175474E89094C44Da98b954EedeAC495271d0F
Kovan testnet at 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa

Weth is available on:

Kovan testnet at 0xd0a1e359811322d97991e03f863a0c30c2cf029c