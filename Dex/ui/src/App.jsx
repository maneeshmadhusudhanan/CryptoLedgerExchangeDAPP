// App.jsx (updated)
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import CLXTokenABI from './abis/CLXToken.json'
import CryptoExchangeABI from './abis/CryptoExchange.json'
import DepositForm from './components/DepositForm'
import WithdrawForm from './components/WithdrawForm'
import TransferForm from './components/TransferForm'
import TradeForm from './components/TradeForm'

const CLX_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const EXCHANGE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

export default function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [clxBalance, setClxBalance] = useState('0')
  const [exchangeBalance, setExchangeBalance] = useState('0')
  const [loading, setLoading] = useState(false)

  // In your loadBalances function, update to:
const loadBalances = async () => {
  try {
    // Use signer instead of provider for contract interactions
    const tokenContract = new ethers.Contract(CLX_TOKEN_ADDRESS, CLXTokenABI.abi, signer)
    const clxBal = await tokenContract.balanceOf(account)
    setClxBalance(ethers.formatUnits(clxBal, 18))
    
    const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, CryptoExchangeABI.abi, signer)
    const exchangeBal = await exchangeContract.balances(account, CLX_TOKEN_ADDRESS)
    setExchangeBalance(ethers.formatUnits(exchangeBal, 18))
  } catch (error) {
    console.error("Error loading balances:", error)
  }
}

// Update your useEffect to handle provider initialization better:
useEffect(() => {
  const init = async () => {
    if (window.ethereum) {
      try {
        // Request accounts first
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        setAccount(accounts[0])
        
        // Create provider after account connection
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        
        // Get signer from provider
        const signer = await provider.getSigner()
        setSigner(signer)
        
        // Wait for provider/signer to be set before loading balances
        await loadBalances()
      } catch (error) {
        console.error("Error initializing:", error)
      }
    }
  }
  init()
}, [])


  const deposit = async (amount) => {
    setLoading(true)
    try {
      const tokenContract = new ethers.Contract(CLX_TOKEN_ADDRESS, CLXTokenABI, signer)
      const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, CryptoExchangeABI, signer)
      
      const txApprove = await tokenContract.approve(EXCHANGE_ADDRESS, amount)
      await txApprove.wait()
      
      const txDeposit = await exchangeContract.deposit(CLX_TOKEN_ADDRESS, amount)
      await txDeposit.wait()
      
      await loadBalances()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const withdraw = async (amount) => {
    setLoading(true)
    try {
      const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, CryptoExchangeABI, signer)
      const tx = await exchangeContract.withdraw(CLX_TOKEN_ADDRESS, amount)
      await tx.wait()
      await loadBalances()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const transfer = async (to, amount) => {
    setLoading(true)
    try {
      const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, CryptoExchangeABI.abi, signer)
      const tx = await exchangeContract.transfer(CLX_TOKEN_ADDRESS, to, amount)
      await tx.wait()
      await loadBalances()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const trade = async (amountIn, amountOut) => {
    setLoading(true)
    try {
      const exchangeContract = new ethers.Contract(EXCHANGE_ADDRESS, CryptoExchangeABI.abi, signer)
      const tx = await exchangeContract.trade(
        CLX_TOKEN_ADDRESS,
        CLX_TOKEN_ADDRESS, // Replace with other token address
        amountIn,
        amountOut
      )
      await tx.wait()
      await loadBalances()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }



  return (
    <div className="min-h-screen bg-gray-100">



<nav className="bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-50 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center">
        <h1 className="text-2xl font-bold text-white font-poppins">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            CRYPTO LEDGER
          </span>
          <span className="text-white ml-2">EXCHANGE</span>
        </h1>
      </div>

      {/* Navigation Items */}
      <div className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
          Trade
        </a>
        <a href="#" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
          Portfolio
        </a>
        <a href="#" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
          Support
        </a>
      </div>

      {/* Wallet Section */}
      <div className="flex items-center space-x-4">
        {account ? (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center bg-black bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30 transition duration-200 cursor-pointer group">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <span className="ml-2 text-xs text-green-400 bg-green-900 bg-opacity-50 px-2 py-1 rounded-full">
                Connected
              </span>
            </div>
          </div>
        ) : (
          <button className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  </div>
</nav>


{/* <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="flex items-center">
      <svg className="h-8 w-8 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <h1 className="text-2xl font-bold text-white tracking-tight">CryptoLedger Exchange</h1>
    </div>
    
    <div className="flex items-center space-x-4">
      {account && (
        <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white border-opacity-20">
          <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
          <span className="font-medium">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      )}
      
      <button className="bg-white text-indigo-600 hover:bg-opacity-90 font-medium px-4 py-2 rounded-lg transition-colors duration-200">
        Connect Wallet
      </button>
    </div>
  </div>
</nav> */}
      
      {/* <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">CryptoLedger Exchange</h1>
          <div className="flex items-center space-x-4">
            {account && (
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </nav> */}




<main className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
  <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {/* Wallet Balances Card */}
      <div className="relative bg-purple-500 backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300 
          transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in-up delay-100">
        <div className="flex items-center mb-6 group">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg transition-all duration-300 group-hover:rotate-12">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 
              transition-all duration-500 hover:bg-gradient-to-l">
            WALLET BALANCES
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-white hover:shadow">
            <span className="text-gray-600 font-medium">CLX Balance:</span>
            <span className="text-blue-600 font-semibold animate-pulse">{clxBalance}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-white hover:shadow">
            <span className="text-gray-600 font-medium">Exchange Balance:</span>
            <span className="text-purple-600 font-semibold animate-pulse">{exchangeBalance}</span>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Card */}
      <div className="relative bg-green-400 backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300 
          transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in-up delay-200">
        <div className="flex items-center mb-6 group">
          <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg transition-all duration-300 group-hover:rotate-12">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 
              transition-all duration-500 hover:bg-gradient-to-l">
            Deposit/Withdraw
          </h2>
        </div>
        <div className="space-y-6">
          <DepositForm 
            onSubmit={deposit} 
            loading={loading}
            className="transform transition-all hover:scale-[1.005] hover:shadow-md"
          />
          <div className="border-t border-gray-200 my-6 transform transition-all group-hover:scale-x-105"></div>
          <WithdrawForm 
            onSubmit={withdraw} 
            loading={loading}
            className="transform transition-all hover:scale-[1.005] hover:shadow-md"
          />
        </div>
      </div>

      {/* Transfer Card */}
      <div className="relative bg-yellow-500 backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300 
          transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in-up delay-300">
        <div className="flex items-center mb-6 group">
          <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg transition-all duration-300 group-hover:rotate-12">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 
              transition-all duration-500 hover:bg-gradient-to-l">
            Transfer Funds
          </h2>
        </div>
        <TransferForm 
          onSubmit={transfer} 
          loading={loading}
          className="transform transition-all hover:scale-[1.005] hover:shadow-md"
        />
      </div>

      {/* Trade Card */}
      <div className="relative bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300 
          transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in-up delay-400">
        <div className="flex items-center mb-6 group">
          <div className="p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg transition-all duration-300 group-hover:rotate-12">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600 
              transition-all duration-500 hover:bg-gradient-to-l">
            Trade Assets
          </h2>
        </div>
        <TradeForm 
          onSubmit={trade} 
          loading={loading}
          className="transform transition-all hover:scale-[1.005] hover:shadow-md"
        />
      </div>
    </div>
  </div>
</main>

{/* 
<main className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
  <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {/* Wallet Balances Card */}
      {/* <div className="bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300">
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Wallet Balances
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">CLX Balance:</span>
            <span className="text-blue-600 font-semibold">{clxBalance}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Exchange Balance:</span>
            <span className="text-purple-600 font-semibold">{exchangeBalance}</span>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Card */}
      {/* <div className="bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300">
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
            Deposit/Withdraw
          </h2>
        </div>
        <div className="space-y-6">
          <DepositForm 
            onSubmit={deposit} 
            loading={loading}
            className="transform transition-all hover:scale-[1.005]"
          />
          <div className="border-t border-gray-200 my-6"></div>
          <WithdrawForm 
            onSubmit={withdraw} 
            loading={loading}
            className="transform transition-all hover:scale-[1.005]"
          />
        </div>
      </div> */}

      {/* Transfer Card */}
      {/* <div className="bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300">
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
            Transfer Funds
          </h2>
        </div>
        <TransferForm 
          onSubmit={transfer} 
          loading={loading}
          className="transform transition-all hover:scale-[1.005]"
        />
      </div> */}

      {/* Trade Card */}
      {/* <div className="bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-xl shadow-lg border border-opacity-10 border-gray-300">
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600">
            Trade Assets
          </h2>
        </div>
        <TradeForm 
          onSubmit={trade} 
          loading={loading}
          className="transform transition-all hover:scale-[1.005]"
        />
      </div>
    </div> */}
  {/* </div> */}
{/* // </main>  */}

      {/* <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Wallet Balances</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                CLX Balance: <span className="font-medium">{clxBalance}</span>
              </p>
              <p className="text-gray-600">
                Exchange Balance: <span className="font-medium">{exchangeBalance}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Deposit/Withdraw</h2>
            <div className="space-y-4">
              <DepositForm onSubmit={deposit} loading={loading} />
              <WithdrawForm onSubmit={withdraw} loading={loading} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Transfer</h2>
            <TransferForm onSubmit={transfer} loading={loading} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Trade</h2>
            <TradeForm onSubmit={trade} loading={loading} />
          </div>
        </div>
      </main> */}
    </div>
  )
}