// components/TradeForm.jsx
import { useState } from 'react'
import { ethers } from 'ethers'

export default function TradeForm({ onSubmit, loading }) {
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amountIn || !amountOut) return
    onSubmit(
      ethers.parseUnits(amountIn, 18),
      ethers.parseUnits(amountOut, 18)
    )
    setAmountIn('')
    setAmountOut('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="number"
          step="0.0001"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="Amount in"
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <span className="self-center">→</span>
        <input
          type="number"
          step="0.0001"
          value={amountOut}
          onChange={(e) => setAmountOut(e.target.value)}
          placeholder="Amount out"
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Trade'}
      </button>
    </form>
  )
}