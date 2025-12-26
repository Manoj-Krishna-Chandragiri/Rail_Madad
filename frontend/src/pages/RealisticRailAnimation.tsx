import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Types for animation phases
type AnimationPhase = 'incident' | 'processing' | 'routing' | 'resolution';

// Railway station and train images from cloudinary
const RAILWAY_IMAGES = {
  background: 'https://res.cloudinary.com/dbnkhibzi/image/upload/v1751548248/Railways_Image_qxrrvn.png',
  trainInterior: 'https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838752/Screenshot_2025-08-10_204040_skrm4a.png',
  station: 'https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838233/Screenshot_2025-08-10_203235_gnws2l.png',
  dashboard: 'https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838001/Screenshot_2025-07-29_145504_it7pzi.png',
  complaints: 'https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-07-29_145252_cjq6bp.png'
};

// Realistic Train Coach Component (Vande Bharat style)
const VandeBharatTrain: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const trainGroupRef = useRef<THREE.Group>(null);
  const [complaintParticles, setComplaintParticles] = useState<Array<{ id: number; position: THREE.Vector3; delay: number }>>([]);

  // Load train texture
  const trainTexture = useLoader(THREE.TextureLoader, RAILWAY_IMAGES.trainInterior);

  useFrame((state) => {
    if (trainGroupRef.current) {
      // Realistic train movement - slight swaying and forward motion
      trainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      trainGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
      
      // Forward movement during different phases
      if (animationPhase === 'processing') {
        trainGroupRef.current.position.x = -4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    }
  });

  // Generate complaint particles during incident
  useEffect(() => {
    if (animationPhase === 'incident') {
      const particles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        position: new THREE.Vector3(
          -2 + Math.random() * 0.5,
          0.5 + Math.random() * 0.3,
          0.3 + Math.random() * 0.2
        ),
        delay: i * 0.4
      }));
      setComplaintParticles(particles);
    } else {
      setComplaintParticles([]);
    }
  }, [animationPhase]);

  return (
    <group ref={trainGroupRef} position={[-4, 0, 0]}>
      {/* Main Train Body - Multiple Coaches */}
      {Array.from({ length: 3 }).map((_, coachIndex) => (
        <group key={coachIndex} position={[coachIndex * 5, 0, 0]}>
          {/* Coach Body */}
          <mesh>
            <boxGeometry args={[4.8, 1.4, 1.2]} />
            <meshPhysicalMaterial 
              color="#e3f2fd"
              map={trainTexture}
              transparent
              opacity={0.9}
              transmission={0.1}
              roughness={0.2}
              metalness={0.8}
              clearcoat={1.0}
            />
          </mesh>

          {/* Coach Roof */}
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[4.8, 0.2, 1.2]} />
            <meshStandardMaterial color="#1976d2" />
          </mesh>

          {/* Windows - Realistic spacing */}
          {Array.from({ length: 8 }).map((_, windowIndex) => (
            <mesh key={windowIndex} position={[-2 + windowIndex * 0.5, 0.4, 0.61]}>
              <planeGeometry args={[0.35, 0.6]} />
              <meshStandardMaterial 
                color="#87ceeb" 
                transparent 
                opacity={0.8}
                emissive="#87ceeb"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))}

          {/* Doors */}
          <mesh position={[-1.5, 0, 0.61]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color="#2196f3" />
          </mesh>
          <mesh position={[1.5, 0, 0.61]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color="#2196f3" />
          </mesh>

          {/* Wheels - Realistic train wheels */}
          {Array.from({ length: 4 }).map((_, wheelIndex) => (
            <group key={wheelIndex} position={[-1.5 + wheelIndex * 1, -0.9, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Wheel spokes */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.35, 8]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            </group>
          ))}

          {/* Pantograph (for electric trains) */}
          {coachIndex === 1 && (
            <group position={[0, 1.2, 0]}>
              <mesh>
                <boxGeometry args={[0.1, 0.8, 0.1]} />
                <meshStandardMaterial color="#444444" />
              </mesh>
              <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
                <boxGeometry args={[1.2, 0.05, 0.05]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Passenger Silhouettes inside train */}
      {Array.from({ length: 12 }).map((_, passengerIndex) => {
        const coachIndex = Math.floor(passengerIndex / 4);
        const seatIndex = passengerIndex % 4;
        return (
          <mesh 
            key={passengerIndex} 
            position={[
              coachIndex * 5 - 1.5 + seatIndex * 0.8, 
              0.2, 
              0.3
            ]}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#444444" 
              transparent 
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Complaint emission from specific window */}
      {animationPhase === 'incident' && (
        <mesh position={[-2, 0.6, 0.8]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Complaint particles with realistic icons */}
      {complaintParticles.map((particle, index) => (
        <ComplaintParticle
          key={particle.id}
          position={particle.position}
          delay={particle.delay}
          type={index % 3 === 0 ? 'text' : index % 3 === 1 ? 'image' : 'audio'}
        />
      ))}
    </group>
  );
};

// Realistic Complaint Particle Component
const ComplaintParticle: React.FC<{ 
  position: THREE.Vector3; 
  delay: number;
  type: 'text' | 'image' | 'audio';
}> = ({ position, delay, type }) => {
  const particleRef = useRef<THREE.Group>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (particleRef.current && isActive) {
      // Floating upward motion
      particleRef.current.position.y += 0.01;
      particleRef.current.rotation.y += 0.02;
      
      // Fade out as it rises
      if (particleRef.current.position.y > position.y + 2) {
        setIsActive(false);
      }
    }
  });

  const getParticleColor = () => {
    switch (type) {
      case 'text': return '#ff6b6b';
      case 'image': return '#4ecdc4';
      case 'audio': return '#45b7d1';
      default: return '#ff6b6b';
    }
  };

  const getParticleGeometry = () => {
    switch (type) {
      case 'text': return <boxGeometry args={[0.1, 0.1, 0.02]} />;
      case 'image': return <planeGeometry args={[0.1, 0.08]} />;
      case 'audio': return <sphereGeometry args={[0.05, 8, 8]} />;
      default: return <sphereGeometry args={[0.05, 8, 8]} />;
    }
  };

  return (
    <group ref={particleRef} position={[position.x, position.y, position.z]} visible={isActive}>
      <mesh>
        {getParticleGeometry()}
        <meshStandardMaterial 
          color={getParticleColor()}
          emissive={getParticleColor()}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// AI Processing Prism - Futuristic but realistic
const AIProcessingPrism: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const prismRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const isProcessing = animationPhase === 'processing';

  useFrame((state) => {
    if (prismRef.current) {
      prismRef.current.rotation.y += isProcessing ? 0.02 : 0.005;
      prismRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }

    if (coreRef.current && isProcessing) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={prismRef} position={[0, 1, 0]}>
      {/* Main AI Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.8, 2]} />
        <meshPhysicalMaterial
          color={isProcessing ? "#9c27b0" : "#673ab7"}
          emissive={isProcessing ? "#9c27b0" : "#673ab7"}
          emissiveIntensity={isProcessing ? 0.6 : 0.2}
          transparent
          opacity={0.9}
          transmission={0.3}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Processing rings */}
      {isProcessing && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 3]}>
              <ringGeometry args={[1.2 + i * 0.3, 1.4 + i * 0.3, 32]} />
              <meshStandardMaterial
                color="#e91e63"
                transparent
                opacity={0.6 - i * 0.15}
                emissive="#e91e63"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Holographic data streams */}
      {isProcessing && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh 
            key={i} 
            position={[
              Math.cos(angle) * 1.5,
              Math.sin(angle * 2) * 0.3,
              Math.sin(angle) * 1.5
            ]}
          >
            <boxGeometry args={[0.05, 0.05, 0.3]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Railway Station Platform
const RailwayStation: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  const stationRef = useRef<THREE.Group>(null);
  const stationTexture = useLoader(THREE.TextureLoader, RAILWAY_IMAGES.station);

  return (
    <group ref={stationRef} position={[8, -1, 0]}>
      {/* Platform */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Station Building */}
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[6, 3, 1]} />
        <meshStandardMaterial
          map={stationTexture}
          color="#f5f5f5"
        />
      </mesh>

      {/* Station Roof */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[7, 0.3, 4]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>

      {/* Platform Pillars */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-2.5 + i * 1.5, 1.5, 1]}>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}

      {/* Waiting Passengers */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-2 + i * 0.8, 0.3, 0.5]}>
          <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 50%, 50%)`}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Smart Data Flow Trails
const DataFlowTrail: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  isActive: boolean;
  label: string;
}> = ({ start, end, color, isActive, label }) => {
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
      const currentPos = start.clone().lerp(end, progress);
      particleRef.current.position.copy(currentPos);
      particleRef.current.rotation.x += 0.1;
      particleRef.current.rotation.y += 0.1;
    }
  });

  if (!isActive) return null;

  const direction = end.clone().sub(start).normalize();
  const distance = start.distanceTo(end);

  return (
    <group ref={trailRef}>
      {/* Trail line */}
      <mesh position={start.clone().lerp(end, 0.5)} lookAt={end}>
        <cylinderGeometry args={[0.02, 0.02, distance]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Moving data packet */}
      <mesh ref={particleRef}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Data label */}
      <mesh position={start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.3, 0))}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Resolution Department Buildings
const ResolutionDepartment: React.FC<{
  position: THREE.Vector3;
  type: 'maintenance' | 'support' | 'feedback';
  isActive: boolean;
  isResolved: boolean;
}> = ({ position, type, isActive, isResolved }) => {
  const deptRef = useRef<THREE.Group>(null);

  const departmentConfig = {
    maintenance: { color: '#ff9800', icon: '🔧', name: 'Maintenance' },
    support: { color: '#2196f3', icon: '👥', name: 'Support' },
    feedback: { color: '#4caf50', icon: '📝', name: 'Feedback' }
  };

  const config = departmentConfig[type];

  useFrame((state) => {
    if (deptRef.current && isActive) {
      deptRef.current.rotation.y += 0.01;
      if (isResolved) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        deptRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={deptRef} position={[position.x, position.y, position.z]} visible={isActive}>
      {/* Department Building */}
      <mesh>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={isResolved ? 0.3 : 0.1}
        />
      </mesh>

      {/* Building Roof */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[1, 0.8, 4]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>

      {/* Department Sign */}
      <mesh position={[0, 0.5, 0.76]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Success indicator */}
      {isResolved && (
        <>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#4caf50"
              emissive="#4caf50"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Celebration particles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 1,
                  2 + Math.sin(angle * 2) * 0.3,
                  Math.sin(angle) * 1
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial
                  color="#ffeb3b"
                  emissive="#ffeb3b"
                  emissiveIntensity={0.8}
                />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

// Cinematic Camera Controller
const CinematicCamera: React.FC<{ animationPhase: AnimationPhase }> = ({ animationPhase }) => {
  useFrame(({ camera }) => {
    const positions = {
      incident: { x: -8, y: 3, z: 8 },
      processing: { x: -2, y: 4, z: 6 },
      routing: { x: 3, y: 3, z: 5 },
      resolution: { x: 6, y: 2, z: 4 }
    };

    const lookAts = {
      incident: { x: -4, y: 0, z: 0 },
      processing: { x: 0, y: 1, z: 0 },
      routing: { x: 4, y: 0, z: 0 },
      resolution: { x: 6, y: 0, z: 0 }
    };

    const targetPos = positions[animationPhase];
    const targetLookAt = lookAts[animationPhase];

    camera.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z), 0.02);
    camera.lookAt(new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z));
  });

  return null;
};

// Main Realistic Animation Scene
const RealisticAnimationScene: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('incident');
  const [dataFlowActive, setDataFlowActive] = useState({
    maintenance: false,
    support: false,
    feedback: false
  });
  const [departmentsResolved, setDepartmentsResolved] = useState({
    maintenance: false,
    support: false,
    feedback: false
  });

  // Animation sequence following the detailed prompt
  useEffect(() => {
    const cinematicSequence = async () => {
      // Reset state
      setDataFlowActive({ maintenance: false, support: false, feedback: false });
      setDepartmentsResolved({ maintenance: false, support: false, feedback: false });

      // Chapter 1: The Inciting Incident (0-3 seconds)
      setAnimationPhase('incident');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'incident' }));
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Chapter 2: The AI's Intervention (3-7 seconds)
      setAnimationPhase('processing');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chapter 3: Smart Routing and Action (7-12 seconds)
      setAnimationPhase('routing');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'routing' }));
      setDataFlowActive({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Chapter 4: The Resolution (12-15 seconds)
      setAnimationPhase('resolution');
      window.dispatchEvent(new CustomEvent('phaseChange', { detail: 'resolution' }));
      setDepartmentsResolved({
        maintenance: true,
        support: true,
        feedback: true
      });
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Pause before next cycle
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    cinematicSequence();
    const interval = setInterval(cinematicSequence, 17000); // 15s animation + 2s pause
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cinematic Camera */}
      <CinematicCamera animationPhase={animationPhase} />

      {/* Realistic Lighting Setup */}
      <ambientLight intensity={0.4} color="#f5f5f5" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        color="#ffffff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#9c27b0" />
      <spotLight
        position={[8, 8, 8]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#42a5f5"
        castShadow
      />

      {/* Railway Environment */}
      <VandeBharatTrain animationPhase={animationPhase} />
      <RailwayStation animationPhase={animationPhase} />
      <AIProcessingPrism animationPhase={animationPhase} />

      {/* Data Flow Trails */}
      <DataFlowTrail
        start={new THREE.Vector3(0, 1, 0)}
        end={new THREE.Vector3(4, 0, 2)}
        color="#ff9800"
        isActive={dataFlowActive.maintenance}
        label="Maintenance"
      />
      <DataFlowTrail
        start={new THREE.Vector3(0, 1, 0)}
        end={new THREE.Vector3(4, 0, -2)}
        color="#2196f3"
        isActive={dataFlowActive.support}
        label="Support"
      />
      <DataFlowTrail
        start={new THREE.Vector3(0, 1, 0)}
        end={new THREE.Vector3(6, 1, 0)}
        color="#4caf50"
        isActive={dataFlowActive.feedback}
        label="Feedback"
      />

      {/* Resolution Departments */}
      <ResolutionDepartment
        position={new THREE.Vector3(4, 0, 2)}
        type="maintenance"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={departmentsResolved.maintenance}
      />
      <ResolutionDepartment
        position={new THREE.Vector3(4, 0, -2)}
        type="support"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={departmentsResolved.support}
      />
      <ResolutionDepartment
        position={new THREE.Vector3(6, 1, 0)}
        type="feedback"
        isActive={animationPhase === 'routing' || animationPhase === 'resolution'}
        isResolved={departmentsResolved.feedback}
      />

      {/* Railway Tracks */}
      <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[20, 0.1, 0.3]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh position={[0, -1.2, 0.5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[20, 0.1, 0.3]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>

      {/* Railway Sleepers */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[-10 + i * 1, -1.15, 0.25]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.2, 1.2]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      ))}

      {/* Ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8bc34a" />
      </mesh>

      {/* Sky */}
      <mesh position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#87ceeb" />
      </mesh>

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#87ceeb', 15, 50]} />
    </>
  );
};

// Enhanced Phase Indicator
const EnhancedPhaseIndicator: React.FC<{ phase: AnimationPhase }> = ({ phase }) => {
  const getPhaseInfo = (currentPhase: AnimationPhase) => {
    switch (currentPhase) {
      case 'incident':
        return {
          color: 'bg-red-500',
          text: 'Complaint Detected',
          description: 'Passenger files complaint from train',
          icon: '🚨'
        };
      case 'processing':
        return {
          color: 'bg-purple-500',
          text: 'AI Processing',
          description: 'Advanced AI categorizes and prioritizes',
          icon: '🤖'
        };
      case 'routing':
        return {
          color: 'bg-blue-500',
          text: 'Smart Routing',
          description: 'Directing to appropriate departments',
          icon: '🔄'
        };
      case 'resolution':
        return {
          color: 'bg-green-500',
          text: 'Resolution Complete',
          description: 'Issue resolved successfully',
          icon: '✅'
        };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  return (
    <div className="absolute top-6 right-6 text-white z-20">
      <div className="bg-black bg-opacity-60 px-6 py-4 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-2xl">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{phaseInfo.icon}</span>
          <div>
            <div className="text-xs opacity-70 mb-1">Current Phase</div>
            <div className="text-lg font-bold flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 animate-pulse ${phaseInfo.color}`}></div>
              {phaseInfo.text}
            </div>
          </div>
        </div>
        <div className="text-sm opacity-80 border-t border-white border-opacity-20 pt-2">
          {phaseInfo.description}
        </div>
      </div>
    </div>
  );
};

// Loading Component with Railway Theme
const RailwayLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
    {/* Animated railway background */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute bottom-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      <div className="absolute bottom-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse mt-4"></div>
    </div>

    <div className="text-center z-10">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🚄</span>
        </div>
      </div>
      <div className="text-white text-2xl font-bold mb-2">Loading Railway Animation</div>
      <div className="text-gray-300 text-lg">Initializing AI-Powered Rail Madad System</div>
      <div className="text-gray-400 text-sm mt-2">Preparing realistic 3D environment...</div>
    </div>
  </div>
);

// Main Realistic Rail Animation Component
const RealisticRailAnimation: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('incident');

  useEffect(() => {
    const handlePhaseChange = (event: CustomEvent<AnimationPhase>) => {
      setCurrentPhase(event.detail);
    };

    window.addEventListener('phaseChange', handlePhaseChange as EventListener);
    return () => window.removeEventListener('phaseChange', handlePhaseChange as EventListener);
  }, []);

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${RAILWAY_IMAGES.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40"></div>

      <Suspense fallback={<RailwayLoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [-8, 3, 8], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            shadowMap: true
          }}
          dpr={[1, 2]}
        >
          <RealisticAnimationScene />
        </Canvas>
      </Suspense>

      {/* Enhanced UI Overlay */}
      <div className="absolute top-6 left-6 text-white z-20">
        <div className="bg-black bg-opacity-60 px-6 py-4 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚄 AI-Powered Rail Madad
          </h1>
          <p className="text-lg opacity-90 mb-1">
            Intelligent Complaint Resolution System
          </p>
          <p className="text-sm opacity-70">
            Realistic 3D Visualization of Railway Operations
          </p>
        </div>
      </div>

      {/* Dynamic Phase Indicator */}
      <EnhancedPhaseIndicator phase={currentPhase} />

      {/* Progress Timeline */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white z-20">
        <div className="bg-black bg-opacity-60 px-8 py-4 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-2xl">
          <div className="flex items-center space-x-6">
            {['incident', 'processing', 'routing', 'resolution'].map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  currentPhase === phase
                    ? 'bg-white border-white animate-pulse'
                    : 'border-white border-opacity-50'
                }`}></div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    ['incident', 'processing', 'routing'].indexOf(currentPhase) > index
                      ? 'bg-white'
                      : 'bg-white bg-opacity-30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm opacity-80">
            Experience the future of railway complaint resolution
          </div>
        </div>
      </div>

      {/* Railway Stats Overlay */}
      <div className="absolute bottom-6 right-6 text-white z-20">
        <div className="bg-black bg-opacity-60 px-4 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-2xl">
          <div className="text-xs opacity-70 mb-1">System Performance</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-bold">99.9%</div>
              <div className="opacity-70">Uptime</div>
            </div>
            <div>
              <div className="font-bold">&lt;30s</div>
              <div className="opacity-70">Response</div>
            </div>
            <div>
              <div className="font-bold">24/7</div>
              <div className="opacity-70">Support</div>
            </div>
            <div>
              <div className="font-bold">AI</div>
              <div className="opacity-70">Powered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealisticRailAnimation;
export { VandeBharatTrain, AIProcessingPrism, ComplaintParticle, RailwayStation, DataFlowTrail, ResolutionDepartment, RealisticAnimationScene };
export type { AnimationPhase };
