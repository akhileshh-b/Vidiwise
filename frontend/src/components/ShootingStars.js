import React from 'react';
import '../styles/ShootingStars.css';

export default function ShootingStars() {
  const stars = Array(50).fill(null).map((_, i) => {
    const style = {
      '--top-offset': `${Math.random() * 100}vh`,
      '--fall-duration': `${Math.random() * 6 + 6}s`,
      '--fall-delay': `${Math.random() * 10}s`
    };
    return <div key={i} className="star" style={style} />;
  });

  return <div className="stars">{stars}</div>;
}