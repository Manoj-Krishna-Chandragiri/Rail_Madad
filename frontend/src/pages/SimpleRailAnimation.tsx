import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Types for animation phases
type AnimationPhase = 'incident' | 'processing' | 'routing' | 'resolution';

// Simple Train Component
const SimpleTrain: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const trainRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (trainRef.current) {
      trainRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      trainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={trainRef} position={[-3, 0, 0]}>
      {/* Main train body */}
      <mesh>
        <boxGeometry args={[4, 1, 0.8]} />
        <meshStandardMaterial 
          color="#2196f3" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Train windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.5, 0.2, 0.41]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Complaint indicator */}
      {animationPhase === 'incident' && (
        <mesh position={[-1.5, 0.5, 0.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b6b"
            emissive="#ff6b6b"
            emissiveIntensity={0.5}
          />
          <Sparkles count={10} scale={0.3} size={2} speed={1} />
        </mesh>
      )}
    </group>
  );
};

// Simple AI Hub Component
const SimpleAIHub: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const hubRef = useRef<THREE.Mesh>(null);
  const isProcessing = animationPhase === 'processing';

  useFrame((state) => {
    if (hubRef.current) {
      hubRef.current.rotation.x += 0.01;
      hubRef.current.rotation.y += 0.015;
      
      if (isProcessing) {
        hubRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={hubRef}>
        <octahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial
          color={isProcessing ? "#9c27b0" : "#673ab7"}
          emissive={isProcessing ? "#9c27b0" : "#673ab7"}
          emissiveIntensity={isProcessing ? 0.3 : 0.1}
        />
      </mesh>

      {isProcessing && (
        <>
          <Sparkles count={30} scale={1.5} size={3} speed={1.5} />
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            AI PROCESSING...
          </Text>
        </>
      )}
    </group>
  );
};

// Simple Resolution Points
const SimpleResolutionPoint: React.FC<{
  position: [number, number, number];
  type: 'maintenance' | 'support' | 'feedback';
  isActive: boolean;
  isResolved: boolean;
}> = ({ position, type, isActive, isResolved }) => {
  const pointRef = useRef<THREE.Group>(null);

  const colors = {
    maintenance: '#ffa726',
    support: '#42a5f5',
    feedback: '#66bb6a'
  };

  useFrame((state) => {
    if (pointRef.current && isActive) {
      pointRef.current.rotation.y += 0.01;
      if (isResolved) {
        pointRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      }
    }
  });

  return (
    <group ref={pointRef} position={position} visible={isActive}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.4 : 0.1}
        />
      </mesh>

      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.6 : 0.2}
        />
      </mesh>

      {isResolved && (
        <>
          <Sparkles count={20} scale={0.8} size={3} speed={1.5} />
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {type.toUpperCase()}
          </Text>
        </>
      )}
    </group>
  );
};

// Main Animation Scene
const SimpleAnimationScene: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('incident');
  const [endpointsActive, setEndpointsActive] = useState(false);
  const [endpointsResolved, setEndpointsResolved] = useState({
    maintenance: false,
    support: false,
    feedback: false
  });

  // Animation sequence
  useEffect(() => {
    const sequence = async () => {
      // Incident phase
      setAnimationPhase('incident');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Processing phase
      setAnimationPhase('processing');
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Routing phase
      setAnimationPhase('routing');
      setEndpointsActive(true);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Resolution phase
      setAnimationPhase('resolution');
      setEndpointsResolved({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Reset
      setTimeout(() => {
        setAnimationPhase('incident');
        setEndpointsActive(false);
        setEndpointsResolved({ maintenance: false, support: false, feedback: false });
      }, 2000);
    };

    sequence();
    const interval = setInterval(sequence, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#9c27b0" />

      {/* Components */}
      <SimpleTrain animationPhase={animationPhase} />
      <SimpleAIHub animationPhase={animationPhase} />
      
      <SimpleResolutionPoint
        position={[3, 0, 1]}
        type="maintenance"
        isActive={endpointsActive}
        isResolved={endpointsResolved.maintenance}
      />
      <SimpleResolutionPoint
        position={[3, 0, -1]}
        type="support"
        isActive={endpointsActive}
        isResolved={endpointsResolved.support}
      />
      <SimpleResolutionPoint
        position={[3, 1, 0]}
        type="feedback"
        isActive={endpointsActive}
        isResolved={endpointsResolved.feedback}
      />

      {/* Environment */}
      <Environment preset="night" />
      <Sparkles count={50} scale={8} size={1} speed={0.3} />
    </>
  );
};

// Loading Component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-white text-xl">Loading Animation...</div>
  </div>
);

// Main Component
const SimpleRailAnimation: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [-5, 2, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <SimpleAnimationScene />
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Rail Madad</h1>
        <p className="text-sm opacity-80">Intelligent Complaint Resolution System</p>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white z-10">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRailAnimation;
