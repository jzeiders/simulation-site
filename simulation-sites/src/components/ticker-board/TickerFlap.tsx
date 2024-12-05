import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface TickerFlapProps {
  targetChar: string
  index: number
  totalChars: number
}

const TickerFlap: React.FC<TickerFlapProps> = ({ index, totalChars }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isColor, setIsColor] = useState(false)
  const [rotationCount, setRotationCount] = useState(0)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        rotationCount * Math.PI,
        0.1
      )
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationCount((prev) => prev + 1)
      setCurrentIndex((prev) => (prev + 1) % (CHARACTERS.length + COLORS.length))
      setIsColor((prev) => !prev && currentIndex >= CHARACTERS.length - 1)
    }, 100 + index * 20)

    return () => clearInterval(interval)
  }, [index, currentIndex])

  const getCurrentItem = () => {
    if (isColor) {
      return COLORS[currentIndex - CHARACTERS.length]
    }
    return CHARACTERS[currentIndex]
  }

  return (
    <mesh
      ref={meshRef}
      position={[index - totalChars / 2 + 0.5, 0, 0]}
    >
      <boxGeometry args={[0.9, 1.2, 0.1]} />
      <meshStandardMaterial color={isColor ? getCurrentItem() : '#333333'} />
      {!isColor && (
        <>
          <Text
            position={[0, 0, 0.051]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {getCurrentItem()}
          </Text>
          <Text
            position={[0, 0, -0.051]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI, 0]}
          >
            {getCurrentItem()}
          </Text>
        </>
      )}
    </mesh>
  )
}

export default TickerFlap

