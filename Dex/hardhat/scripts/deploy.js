const hre = require("hardhat");

async function main() {
  // Deploy the CLXToken (ERC-20)
  const CLXToken = await hre.ethers.getContractFactory("CLXToken");
  const clxToken = await CLXToken.deploy();
  await clxToken.waitForDeployment();
  const clxTokenAddress = await clxToken.getAddress();
  console.log("CLXToken deployed to:", clxTokenAddress);

  // Deploy CryptoExchange
  const CryptoExchange = await hre.ethers.getContractFactory("CryptoExchange");
  const exchange = await CryptoExchange.deploy();
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log("CryptoExchange deployed to:", exchangeAddress);

  // Output Deployment Addresses
  console.log(`
  ✅ Deployment Complete:
  - CLXToken Address: ${clxTokenAddress}
  - CryptoExchange Address: ${exchangeAddress}
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
