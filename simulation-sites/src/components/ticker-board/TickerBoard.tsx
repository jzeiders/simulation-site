import React, { useState, useEffect } from 'react'
import TickerFlap from './TickerFlap'
import styles from './TickerBoard.module.css'

interface TickerBoardProps {
  text: string
  updateInterval?: number
}

const TickerBoard: React.FC<TickerBoardProps> = ({ text, updateInterval = 100 }) => {
  const [displayText, setDisplayText] = useState(' '.repeat(text.length))

  useEffect(() => {
    let currentIndex = 0
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => 
          prev.substring(0, currentIndex) + text[currentIndex] + prev.substring(currentIndex + 1)
        )
        currentIndex++
      } else {
        clearInterval(intervalId)
      }
    }, updateInterval)

    return () => clearInterval(intervalId)
  }, [text, updateInterval])

  return (
    <div className={styles.tickerBoard}>
      {displayText.split('').map((char, index) => (
        <TickerFlap key={index} char={char} />
      ))}
    </div>
  )
}

export default TickerBoard

