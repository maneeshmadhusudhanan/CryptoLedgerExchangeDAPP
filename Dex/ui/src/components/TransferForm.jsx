// components/TransferForm.jsx
import { useState } from 'react'
import { ethers } from 'ethers'

export default function TransferForm({ onSubmit, loading }) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !recipient) return
    onSubmit(recipient, ethers.parseUnits(amount, 18))
    setAmount('')
    setRecipient('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        className="p-2 border rounded"
        disabled={loading}
      />
      <input
        type="number"
        step="0.0001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="CLX amount"
        className="p-2 border rounded"
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Transfer'}
      </button>
    </form>
  )
}