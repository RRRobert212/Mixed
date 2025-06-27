// components/ConnectionLines.js
import React from 'react';
import Svg, { Line } from 'react-native-svg';
import { Dimensions } from 'react-native';

export default function ConnectionLines({ wordPositions, connections }) {
  const { width, height } = Dimensions.get('window');

  return (
    <Svg 
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      width={width} 
      height={height}
    >
      {connections.map(([i1, i2], idx) => {
        const w1 = wordPositions[i1];
        const w2 = wordPositions[i2];
        if (!w1 || !w2) return null;

        const x1 = w1.x + w1.width / 2;
        const y1 = w1.y + w1.height / 2;
        const x2 = w2.x + w2.width / 2;
        const y2 = w2.y + w2.height / 2;

        return (
          <Line
            key={idx}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="orange"
            strokeWidth="2"
          />
        );
      })}
    </Svg>
  );
}
