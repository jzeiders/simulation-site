import React, { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import TickerFlap from './TickerFlap'

interface TickerBoard3DProps {
  text: string
}

const TickerBoard3D: React.FC<TickerBoard3DProps> = ({ text }) => {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {text.split('').map((char, index) => (
            <TickerFlap key={index} targetChar={char} index={index} totalChars={text.length} />
          ))}
        </group>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}

export default TickerBoard3D

