// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CryptoExchange {
    address public owner;
    mapping(address => mapping(address => uint256)) public balances; 

    event Deposit(address indexed user, address token, uint256 amount);
    event Transfer(address indexed from, address indexed to, address token, uint256 amount);
    event Trade(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Deposit ERC-20 tokens into the exchange
    function deposit(address token, uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender][token] += amount;
        emit Deposit(msg.sender, token, amount);
    }

    // Transfer tokens between users inside the exchange
    function transfer(address token, address to, uint256 amount) external {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        balances[to][token] += amount;
        emit Transfer(msg.sender, to, token, amount);
    }

    // Trade one token for another (mock logic, integrate Uniswap for real swapping)
    function trade(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut) external {
        require(balances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");

        // Simulate token swap (replace with Uniswap integration)
        balances[msg.sender][tokenIn] -= amountIn;
        balances[msg.sender][tokenOut] += amountOut;

        emit Trade(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // Withdraw tokens from the exchange back to user's wallet
    function withdraw(address token, uint256 amount) external {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }
}
