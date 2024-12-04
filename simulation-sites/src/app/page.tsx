'use client'

import React, { useState, useEffect } from 'react'
import TickerBoard3D from '../components/TickerBoard3D'

export default function Home() {
  const [text, setText] = useState('WELCOME')

  useEffect(() => {
    const messages = [
      'WELCOME',
      'COLORS',
      'AND TEXT',
      '3D BOARD',
    ]
    let index = 0

    const intervalId = setInterval(() => {
      index = (index + 1) % messages.length
      setText(messages[index])
    }, 10000) // Changed to 10 seconds to allow more time for the carousel effect

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="w-full h-screen bg-gray-900">
      <TickerBoard3D text={text} />
    </div>
  )
}

