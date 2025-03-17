const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoExchange Contract", function () {
  let CryptoExchange, exchange, CLXToken, token, owner, user1, user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy ERC-20 token (CLX)
    CLXToken = await ethers.getContractFactory("CLXToken");
    token = await CLXToken.deploy();
    await token.waitForDeployment();

    // Deploy CryptoExchange
    CryptoExchange = await ethers.getContractFactory("CryptoExchange");
    exchange = await CryptoExchange.deploy();
    await exchange.waitForDeployment();

    // Mint tokens to users for testing
    await token.transfer(user1.address, ethers.parseUnits("1000", 18));
    await token.transfer(user2.address, ethers.parseUnits("1000", 18));
  });

  it("Should allow users to deposit tokens into the exchange", async function () {
    // Approve exchange contract to spend user1's tokens
    await token.connect(user1).approve(await exchange.getAddress(), ethers.parseUnits("100", 18));

    // Deposit tokens into exchange
    await expect(exchange.connect(user1).deposit(await token.getAddress(), ethers.parseUnits("100", 18)))
      .to.emit(exchange, "Deposit")
      .withArgs(user1.address, await token.getAddress(), ethers.parseUnits("100", 18));

    // Verify balance in exchange
    expect(await exchange.balances(user1.address, await token.getAddress())).to.equal(ethers.parseUnits("100", 18));
  });

  it("Should allow users to transfer tokens within the exchange", async function () {
    // Approve and deposit tokens first
    await token.connect(user1).approve(await exchange.getAddress(), ethers.parseUnits("50", 18));
    await exchange.connect(user1).deposit(await token.getAddress(), ethers.parseUnits("50", 18));

    // Transfer tokens from user1 to user2
    await expect(exchange.connect(user1).transfer(await token.getAddress(), user2.address, ethers.parseUnits("20", 18)))
      .to.emit(exchange, "Transfer")
      .withArgs(user1.address, user2.address, await token.getAddress(), ethers.parseUnits("20", 18));

    // Verify updated balances
    expect(await exchange.balances(user1.address, await token.getAddress())).to.equal(ethers.parseUnits("30", 18));
    expect(await exchange.balances(user2.address, await token.getAddress())).to.equal(ethers.parseUnits("20", 18));
  });

  it("Should allow users to trade tokens within the exchange", async function () {
    // Approve and deposit tokens first
    await token.connect(user1).approve(await exchange.getAddress(), ethers.parseUnits("100", 18));
    await exchange.connect(user1).deposit(await token.getAddress(), ethers.parseUnits("100", 18));

    // Simulate trading: Assume 100 CLX = 50 FakeToken
    await expect(exchange.connect(user1).trade(await token.getAddress(), await token.getAddress(), ethers.parseUnits("50", 18), ethers.parseUnits("25", 18)))
      .to.emit(exchange, "Trade")
      .withArgs(user1.address, await token.getAddress(), await token.getAddress(), ethers.parseUnits("50", 18), ethers.parseUnits("25", 18));

    // Verify balances after trade
    expect(await exchange.balances(user1.address, await token.getAddress())).to.equal(ethers.parseUnits("75", 18));
  });

  it("Should allow users to withdraw tokens from the exchange", async function () {
    // Approve and deposit tokens first
    await token.connect(user1).approve(await exchange.getAddress(), ethers.parseUnits("100", 18));
    await exchange.connect(user1).deposit(await token.getAddress(), ethers.parseUnits("100", 18));

    // Withdraw 50 tokens
    await expect(exchange.connect(user1).withdraw(await token.getAddress(), ethers.parseUnits("50", 18)))
      .to.changeTokenBalances(token, [user1, exchange], [ethers.parseUnits("50", 18), -ethers.parseUnits("50", 18)]);

    // Verify updated balance in exchange
    expect(await exchange.balances(user1.address, await token.getAddress())).to.equal(ethers.parseUnits("50", 18));
  });

  it("Should not allow users to trade without sufficient balance", async function () {
    await expect(exchange.connect(user1).trade(await token.getAddress(), await token.getAddress(), ethers.parseUnits("5000", 18), ethers.parseUnits("2500", 18)))
      .to.be.revertedWith("Insufficient balance");
  });

  it("Should not allow users to withdraw more than their balance", async function () {
    await expect(exchange.connect(user1).withdraw(await token.getAddress(), ethers.parseUnits("5000", 18)))
      .to.be.revertedWith("Insufficient balance");
  });

});
