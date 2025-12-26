import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Text,
  Sparkles,
  Float,
  MeshDistortMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Types for animation phases
type AnimationPhase = 'incident' | 'processing' | 'routing' | 'resolution';

interface ParticleData {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'complaint' | 'maintenance' | 'support' | 'feedback';
  color: string;
  life: number;
}

// Complaint particle component
const ComplaintParticle: React.FC<{ 
  position: [number, number, number];
  type: 'complaint' | 'maintenance' | 'support' | 'feedback';
  delay?: number;
}> = ({ position, type, delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isActive, setIsActive] = useState(false);

  const colors = {
    complaint: '#ff6b6b',
    maintenance: '#ffa726',
    support: '#42a5f5',
    feedback: '#66bb6a'
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.001;
    }
  });

  return (
    <mesh ref={meshRef} position={position} visible={isActive}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial 
        color={colors[type]} 
        emissive={colors[type]} 
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
      <Sparkles count={10} scale={0.3} size={2} speed={0.5} />
    </mesh>
  );
};

// 3D Train Model Component
const TrainModel: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<ParticleData[]>([]);

  // Train state
  const [trainGeometry] = useState(() => new THREE.BoxGeometry(4, 1, 0.8));
  const [trainMaterial] = useState(() => new THREE.MeshPhysicalMaterial({
    color: '#2196f3',
    transparent: true,
    opacity: 0.7,
    transmission: 0.3,
    roughness: 0.1,
    metalness: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  }));

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Emit complaint particles during incident phase
  useEffect(() => {
    if (animationPhase === 'incident') {
      const interval = setInterval(() => {
        const newParticle: ParticleData = {
          id: Math.random().toString(36).substring(2, 11),
          position: new THREE.Vector3(-1.5, 0.5, 0),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.02 + 0.01,
            (Math.random() - 0.5) * 0.02
          ),
          type: 'complaint',
          color: '#ff6b6b',
          life: 1.0
        };
        setParticles(prev => [...prev, newParticle]);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [animationPhase]);

  return (
    <group ref={groupRef} position={[-3, 0, 0]}>
      {/* Main train body */}
      <mesh geometry={trainGeometry} material={trainMaterial}>
        {/* Internal circuit network */}
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 0.8,
              (Math.random() - 0.5) * 0.6
            ]}>
              <cylinderGeometry args={[0.005, 0.005, Math.random() * 0.5 + 0.1]} />
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#00ffff" 
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      </mesh>

      {/* Train windows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.4, 0.2, 0.41]}>
          <planeGeometry args={[0.25, 0.3]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.6}
            emissive="#87ceeb"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Complaint emission point */}
      {animationPhase === 'incident' && (
        <mesh position={[-1.5, 0.3, 0.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <MeshDistortMaterial
            color="#ff6b6b"
            distort={0.3}
            speed={2}
            roughness={0.4}
          />
          <Sparkles count={20} scale={0.5} size={3} speed={1} />
        </mesh>
      )}

      {/* Particle system for complaints */}
      {particles.map(particle => (
        <ComplaintParticle
          key={particle.id}
          position={[particle.position.x, particle.position.y, particle.position.z]}
          type={particle.type}
        />
      ))}
    </group>
  );
};

// AI Processing Hub Component
const AIProcessingHub: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const prismRef = useRef<THREE.Mesh>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(animationPhase === 'processing');
  }, [animationPhase]);

  useFrame((state) => {
    if (prismRef.current) {
      prismRef.current.rotation.x += 0.01;
      prismRef.current.rotation.y += 0.015;
      prismRef.current.rotation.z += 0.005;
      
      if (isProcessing) {
        prismRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central processing prism */}
      <mesh ref={prismRef}>
        <octahedronGeometry args={[0.8, 2]} />
        <meshPhysicalMaterial
          color={isProcessing ? "#9c27b0" : "#673ab7"}
          transparent
          opacity={0.8}
          transmission={0.4}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive={isProcessing ? "#9c27b0" : "#673ab7"}
          emissiveIntensity={isProcessing ? 0.3 : 0.1}
        />
      </mesh>

      {/* Processing effect rings */}
      {isProcessing && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1 + i * 0.3, 1.1 + i * 0.3, 32]} />
              <meshStandardMaterial
                color="#e91e63"
                transparent
                opacity={0.6 - i * 0.15}
                emissive="#e91e63"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
          <Sparkles count={50} scale={2} size={4} speed={2} />
        </>
      )}

      {/* Data processing visualization */}
      {isProcessing && (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            AI PROCESSING...
          </Text>
        </Float>
      )}
    </group>
  );
};

// Data Flow Trail Component
const DataFlowTrail: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  isActive: boolean;
  type: 'maintenance' | 'support' | 'feedback';
}> = ({ start, end, color, isActive, type }) => {
  const trailRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      gsap.to({ progress: 0 }, {
        progress: 1,
        duration: 2,
        ease: "power2.out",
        onUpdate: function() {
          setProgress(this.targets()[0].progress);
        }
      });
    }
  }, [isActive]);

  const currentPosition = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
    progress
  );

  return (
    <group ref={trailRef}>
      {isActive && (
        <>
          {/* Trail line */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02,
              new THREE.Vector3(...start).distanceTo(new THREE.Vector3(...end))
            ]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Moving particle */}
          <mesh position={[currentPosition.x, currentPosition.y, currentPosition.z]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
            />
            <Sparkles count={15} scale={0.4} size={3} speed={1.5} />
          </mesh>
        </>
      )}
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
  const groupRef = useRef<THREE.Group>(null);
  const iconRef = useRef<THREE.Mesh>(null);

  const colors = {
    maintenance: '#ffa726',
    support: '#42a5f5',
    feedback: '#66bb6a'
  };

  const icons = {
    maintenance: '🔧',
    support: '👤',
    feedback: '😊'
  };

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y += 0.01;
      if (isResolved) {
        groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.4 : 0.1}
        />
      </mesh>

      {/* Icon representation */}
      <mesh ref={iconRef}>
        {type === 'maintenance' && <boxGeometry args={[0.3, 0.6, 0.1]} />}
        {type === 'support' && <sphereGeometry args={[0.3, 16, 16]} />}
        {type === 'feedback' && <coneGeometry args={[0.3, 0.6, 8]} />}
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={isResolved ? 0.6 : 0.2}
        />
      </mesh>

      {/* Resolution effect */}
      {isResolved && (
        <>
          <Sparkles count={30} scale={1} size={5} speed={2} />
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#4caf50"
              emissive="#4caf50"
              emissiveIntensity={0.8}
            />
          </mesh>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.15}
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

// Cinematic Camera Controller
const CinematicCamera: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const { camera } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(camera as THREE.PerspectiveCamera);

  useEffect(() => {
    const positions = {
      incident: { x: -5, y: 2, z: 5 },
      processing: { x: 0, y: 3, z: 6 },
      routing: { x: 2, y: 2, z: 4 },
      resolution: { x: 4, y: 1, z: 3 }
    };

    const lookAts = {
      incident: { x: -3, y: 0, z: 0 },
      processing: { x: 0, y: 0, z: 0 },
      routing: { x: 2, y: 0, z: 0 },
      resolution: { x: 3, y: 0, z: 0 }
    };

    gsap.to(camera.position, {
      ...positions[animationPhase],
      duration: 2,
      ease: "power2.inOut"
    });

    gsap.to(camera, {
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(
          lookAts[animationPhase].x,
          lookAts[animationPhase].y,
          lookAts[animationPhase].z
        );
      }
    });
  }, [animationPhase, camera]);

  return null;
};

// Main Animation Scene
const AnimationScene: React.FC = () => {
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
      // Chapter 1: The Inciting Incident (0-3 seconds)
      setAnimationPhase('incident');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Chapter 2: The AI's Intervention (3-7 seconds)
      setAnimationPhase('processing');
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chapter 3: Smart Routing and Action (7-12 seconds)
      setAnimationPhase('routing');
      setDataFlowActive({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Chapter 4: The Resolution (12-15 seconds)
      setAnimationPhase('resolution');
      setEndpointsResolved({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Loop the animation
      setTimeout(() => {
        setAnimationPhase('incident');
        setDataFlowActive({ maintenance: false, support: false, feedback: false });
        setEndpointsResolved({ maintenance: false, support: false, feedback: false });
      }, 2000);
    };

    sequence();
    const interval = setInterval(sequence, 17000); // 15s animation + 2s pause
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cinematic Camera */}
      <CinematicCamera animationPhase={animationPhase} />

      {/* Lighting Setup */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#9c27b0" />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color="#42a5f5"
      />

      {/* 3D Train Model */}
      <TrainModel animationPhase={animationPhase} />

      {/* AI Processing Hub */}
      <AIProcessingHub animationPhase={animationPhase} />

      {/* Data Flow Trails */}
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 0, 1]}
        color="#ffa726"
        isActive={dataFlowActive.maintenance}
        type="maintenance"
      />
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 0, -1]}
        color="#42a5f5"
        isActive={dataFlowActive.support}
        type="support"
      />
      <DataFlowTrail
        start={[0, 0, 0]}
        end={[3, 1, 0]}
        color="#66bb6a"
        isActive={dataFlowActive.feedback}
        type="feedback"
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

      {/* Background Environment */}
      <Environment preset="night" />

      {/* Floating particles for atmosphere */}
      <Sparkles count={100} scale={10} size={1} speed={0.3} />
    </>
  );
};

// Loading Component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-white text-xl">Loading AI Animation...</div>
  </div>
);

// Main Export Component
const RailMadadAnimation: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [-5, 2, 5], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <AnimationScene />
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Rail Madad</h1>
        <p className="text-sm opacity-80">Intelligent Complaint Resolution System</p>
      </div>

      {/* Animation Progress Indicator */}
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

export default RailMadadAnimation;
