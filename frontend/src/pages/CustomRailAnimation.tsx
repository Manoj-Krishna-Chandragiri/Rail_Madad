import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Types for animation phases
type AnimationPhase = 'incident' | 'processing' | 'routing' | 'resolution';

// Custom Particle Component
const AnimatedParticle: React.FC<{ 
  position: [number, number, number];
  color: string;
  delay?: number;
}> = ({ position, color, delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Smooth rotation
      meshRef.current.rotation.x += 0.015;
      meshRef.current.rotation.y += 0.015;

      // Floating motion
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + delay) * 0.001;

      // Gentle pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + delay) * 0.15;
      meshRef.current.scale.setScalar(scale);

      // Subtle color animation
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} visible={isActive}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// Enhanced Train Component
const EnhancedTrain: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const trainRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([]);

  useFrame((state) => {
    if (trainRef.current) {
      // Smooth floating animation
      trainRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
      trainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.06;
      trainRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.02;

      // Dynamic movement based on phase
      switch (animationPhase) {
        case 'processing':
          trainRef.current.position.x = -3 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
          break;
        case 'routing':
          trainRef.current.position.x = -3 + Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
          trainRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
          break;
        case 'resolution':
          trainRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
          break;
        default:
          trainRef.current.position.x = -3;
          trainRef.current.position.z = 0;
      }
    }
  });

  // Generate complaint particles during incident
  useEffect(() => {
    if (animationPhase === 'incident') {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        delay: i * 0.3
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [animationPhase]);

  return (
    <group ref={trainRef} position={[-3, 0, 0]}>
      {/* Main train body with glass effect */}
      <mesh>
        <boxGeometry args={[4, 1.2, 1]} />
        <meshPhysicalMaterial 
          color="#1976d2"
          transparent
          opacity={0.85}
          transmission={0.1}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Train roof */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[4, 0.2, 1]} />
        <meshStandardMaterial color="#0d47a1" />
      </mesh>

      {/* Train windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.6, 0.3, 0.51]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.7}
            emissive="#87ceeb"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Wheels */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i} position={[-1.5 + i * 1, -0.8, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}

      {/* Complaint emission area */}
      {animationPhase === 'incident' && (
        <mesh position={[-1.5, 0.8, 0.6]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Animated particles */}
      {particles.map((particle, index) => (
        <AnimatedParticle
          key={particle.id}
          position={[-1.5 + Math.random() * 0.5, 0.8, 0.6 + Math.random() * 0.3]}
          color="#ff6b6b"
          delay={particle.delay}
        />
      ))}
    </group>
  );
};

// Enhanced AI Processing Hub
const EnhancedAIHub: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const hubRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const isProcessing = animationPhase === 'processing';

  useFrame((state) => {
    if (hubRef.current) {
      // Main rotation with variable speed
      hubRef.current.rotation.y += isProcessing ? 0.02 : 0.008;
      hubRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (coreRef.current) {
      // Core pulsing and rotation
      coreRef.current.rotation.x += 0.018;
      coreRef.current.rotation.z += 0.012;

      if (isProcessing) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.25;
        coreRef.current.scale.setScalar(scale);

        // Dynamic color intensity
        const material = coreRef.current.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 6) * 0.3;
      } else {
        // Gentle breathing when not processing
        const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        coreRef.current.scale.setScalar(scale);
      }
    }

    if (ringsRef.current && isProcessing) {
      // Rings rotation with different speeds
      ringsRef.current.rotation.x += 0.025;
      ringsRef.current.rotation.z -= 0.015;
      ringsRef.current.rotation.y += 0.01;

      // Scale animation for rings
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      ringsRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={hubRef} position={[0, 0, 0]}>
      {/* Central AI core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.8, 2]} />
        <meshPhysicalMaterial
          color={isProcessing ? "#9c27b0" : "#673ab7"}
          emissive={isProcessing ? "#9c27b0" : "#673ab7"}
          emissiveIntensity={isProcessing ? 0.4 : 0.1}
          transparent
          opacity={0.9}
          transmission={0.2}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Processing rings */}
      {isProcessing && (
        <group ref={ringsRef}>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 3]}>
              <ringGeometry args={[1.2 + i * 0.4, 1.4 + i * 0.4, 32]} />
              <meshStandardMaterial
                color="#e91e63"
                transparent
                opacity={0.7 - i * 0.2}
                emissive="#e91e63"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Energy particles around hub */}
      {isProcessing && Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 2;
        return (
          <AnimatedParticle
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 0.5,
              Math.sin(angle) * radius
            ]}
            color="#9c27b0"
            delay={i * 0.1}
          />
        );
      })}
    </group>
  );
};

// Data Flow Trail Component
const DataFlowTrail: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  isActive: boolean;
}> = ({ start, end, color, isActive }) => {
  const trailRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      gsap.fromTo({ progress: 0 }, {
        progress: 1,
        duration: 3,
        ease: "power2.out",
        onUpdate: function() {
          setProgress(this.targets()[0].progress);
        },
        repeat: -1,
        yoyo: true
      });
    }
  }, [isActive]);

  useFrame(() => {
    if (particleRef.current && isActive) {
      const startVec = new THREE.Vector3(...start);
      const endVec = new THREE.Vector3(...end);
      const currentPos = startVec.lerp(endVec, progress);
      
      particleRef.current.position.copy(currentPos);
      particleRef.current.rotation.x += 0.1;
      particleRef.current.rotation.y += 0.1;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={trailRef}>
      {/* Trail line */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 
          new THREE.Vector3(...start).distanceTo(new THREE.Vector3(...end))
        ]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Moving particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
};

// Resolution Endpoint Component
const ResolutionEndpoint: React.FC<{
  position: [number, number, number];
  type: 'maintenance' | 'support' | 'feedback';
  isActive: boolean;
  isResolved: boolean;
}> = ({ position, type, isActive, isResolved }) => {
  const endpointRef = useRef<THREE.Group>(null);

  const colors = {
    maintenance: '#ffa726',
    support: '#42a5f5',
    feedback: '#66bb6a'
  };

  useFrame((state) => {
    if (endpointRef.current && isActive) {
      endpointRef.current.rotation.y += 0.02;
      if (isResolved) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.15;
        endpointRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={endpointRef} position={position} visible={isActive}>
      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.4 : 0.1}
        />
      </mesh>

      {/* Icon representation */}
      <mesh>
        {type === 'maintenance' && <boxGeometry args={[0.3, 0.6, 0.1]} />}
        {type === 'support' && <sphereGeometry args={[0.3, 8, 8]} />}
        {type === 'feedback' && <coneGeometry args={[0.3, 0.6, 8]} />}
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.6 : 0.2}
        />
      </mesh>

      {/* Success indicator */}
      {isResolved && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#4caf50"
            emissive="#4caf50"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Resolution particles */}
      {isResolved && Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <AnimatedParticle
            key={i}
            position={[
              Math.cos(angle) * 0.8,
              0.5,
              Math.sin(angle) * 0.8
            ]}
            color={colors[type]}
            delay={i * 0.2}
          />
        );
      })}
    </group>
  );
};

// Cinematic Camera Controller
const CinematicCamera: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>();

  useFrame(({ camera }) => {
    if (!cameraRef.current) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }

    const positions = {
      incident: { x: -6, y: 2, z: 6 },
      processing: { x: -1, y: 3, z: 7 },
      routing: { x: 2, y: 2, z: 5 },
      resolution: { x: 4, y: 1, z: 4 }
    };

    const lookAts = {
      incident: { x: -3, y: 0, z: 0 },
      processing: { x: 0, y: 0, z: 0 },
      routing: { x: 2, y: 0, z: 0 },
      resolution: { x: 3, y: 0, z: 0 }
    };

    // Smooth camera movement
    const targetPos = positions[animationPhase];
    const targetLookAt = lookAts[animationPhase];

    camera.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z), 0.02);

    const lookAtVector = new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z);
    camera.lookAt(lookAtVector);
  });

  return null;
};

// Main Animation Scene
const CustomAnimationScene: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('incident');
  const [dataFlowActive, setDataFlowActive] = useState({
    maintenance: false,
    support: false,
    feedback: false
  });
  const [endpointsResolved, setEndpointsResolved] = useState({
    maintenance: false,
    support: false,
    feedback: false
  });

  // Animation sequence controller
  useEffect(() => {
    const sequence = async () => {
      // Reset state
      setDataFlowActive({ maintenance: false, support: false, feedback: false });
      setEndpointsResolved({ maintenance: false, support: false, feedback: false });

      // Chapter 1: The Incident (0-4 seconds)
      setAnimationPhase('incident');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'incident' }));
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chapter 2: AI Processing (4-8 seconds)
      setAnimationPhase('processing');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chapter 3: Smart Routing (8-13 seconds)
      setAnimationPhase('routing');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'routing' }));
      setDataFlowActive({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Chapter 4: Resolution (13-17 seconds)
      setAnimationPhase('resolution');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'resolution' }));
      setEndpointsResolved({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Pause before loop
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    sequence();
    const interval = setInterval(sequence, 19000); // 17s animation + 2s pause
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cinematic Camera */}
      <CinematicCamera animationPhase={animationPhase} />

      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, 0]} intensity={1} color="#9c27b0" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#2196f3" />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1.2}
        color="#42a5f5"
      />

      {/* Main Components */}
      <EnhancedTrain animationPhase={animationPhase} />
      <EnhancedAIHub animationPhase={animationPhase} />

      {/* Data Flow Trails */}
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 0, 1]}
        color="#ffa726"
        isActive={dataFlowActive.maintenance}
      />
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 0, -1]}
        color="#42a5f5"
        isActive={dataFlowActive.support}
      />
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 1, 0]}
        color="#66bb6a"
        isActive={dataFlowActive.feedback}
      />

      {/* Resolution Endpoints */}
      <ResolutionEndpoint
        position={[3, 0, 1]}
        type="maintenance"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={endpointsResolved.maintenance}
      />
      <ResolutionEndpoint
        position={[3, 0, -1]}
        type="support"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={endpointsResolved.support}
      />
      <ResolutionEndpoint
        position={[3, 1, 0]}
        type="feedback"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={endpointsResolved.feedback}
      />

      {/* Background atmosphere */}
      <fog attach="fog" args={['#1a1a2e', 10, 50]} />
    </>
  );
};

// Loading Component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <div className="text-white text-xl font-semibold">Loading AI Animation...</div>
      <div className="text-gray-300 text-sm mt-2">Initializing 3D Environment</div>
    </div>
  </div>
);

// Phase Indicator Component
const PhaseIndicator: React.FC<{ phase: AnimationPhase }> = ({ phase }) => {
  const getPhaseInfo = (currentPhase: AnimationPhase) => {
    switch (currentPhase) {
      case 'incident':
        return { color: 'bg-red-400', text: 'Incident Detected', description: 'Complaint received from passenger' };
      case 'processing':
        return { color: 'bg-purple-400', text: 'AI Processing', description: 'Analyzing complaint with AI' };
      case 'routing':
        return { color: 'bg-blue-400', text: 'Smart Routing', description: 'Directing to appropriate department' };
      case 'resolution':
        return { color: 'bg-green-400', text: 'Resolution Complete', description: 'Issue resolved successfully' };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  return (
    <div className="absolute top-6 right-6 text-white z-10">
      <div className="bg-black bg-opacity-40 px-4 py-3 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
        <div className="text-xs opacity-70 mb-1">Current Phase</div>
        <div className="text-sm font-semibold flex items-center mb-1">
          <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${phaseInfo.color}`}></div>
          {phaseInfo.text}
        </div>
        <div className="text-xs opacity-60">{phaseInfo.description}</div>
      </div>
    </div>
  );
};

// Main Export Component
const CustomRailAnimation: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('incident');

  // Listen to phase changes from the animation scene
  useEffect(() => {
    const handlePhaseChange = (event: CustomEvent<AnimationPhase>) => {
      setCurrentPhase(event.detail);
    };

    window.addEventListener('phaseChange', handlePhaseChange as EventListener);
    return () => window.removeEventListener('phaseChange', handlePhaseChange as EventListener);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [-6, 2, 6], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          dpr={[1, 2]}
        >
          <CustomAnimationScene />
        </Canvas>
      </Suspense>

      {/* Enhanced UI Overlay */}
      <div className="absolute top-6 left-6 text-white z-10">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI-Powered Rail Madad
        </h1>
        <p className="text-sm opacity-90 bg-black bg-opacity-30 px-3 py-1 rounded-lg backdrop-blur-sm">
          Intelligent Complaint Resolution System
        </p>
      </div>

      {/* Dynamic Phase Indicator */}
      <PhaseIndicator phase={currentPhase} />

      {/* Enhanced Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white z-10">
        <div className="flex space-x-3 bg-black bg-opacity-30 px-6 py-3 rounded-full backdrop-blur-sm">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Floating Action Hint */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white z-10 text-center">
        <div className="bg-black bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-xs opacity-70">Experience the future of railway complaint resolution</div>
        </div>
      </div>
    </div>
  );
};

export default CustomRailAnimation;
export { EnhancedTrain, EnhancedAIHub, DataFlowTrail, ResolutionEndpoint, AnimatedParticle };
export type { AnimationPhase };
