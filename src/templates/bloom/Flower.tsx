"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { mulberry32 } from "../_shared/random";

export type BloomState = { progress: number; holding: boolean; bloomed: boolean };
export type FlowerKind = "peony" | "tulip" | "daisy";

type Ring = {
  count: number;
  length: number;
  width: number;
  open: number;
  closed: number;
  tilt: number;
  curl: number;
  y: number;
  shade: number;
};

const RINGS: Record<FlowerKind, Ring[]> = {
  peony: [
    {
      count: 10,
      length: 0.62,
      width: 0.42,
      open: 1.45,
      closed: 0.12,
      tilt: 0.1,
      curl: 0.55,
      y: 0.0,
      shade: 0.9,
    },
    {
      count: 8,
      length: 0.52,
      width: 0.36,
      open: 1.05,
      closed: 0.1,
      tilt: 0.25,
      curl: 0.5,
      y: 0.03,
      shade: 1,
    },
    {
      count: 6,
      length: 0.4,
      width: 0.3,
      open: 0.7,
      closed: 0.08,
      tilt: 0.4,
      curl: 0.45,
      y: 0.06,
      shade: 1.1,
    },
  ],
  tulip: [
    {
      count: 3,
      length: 0.7,
      width: 0.5,
      open: 0.55,
      closed: 0.05,
      tilt: 0.0,
      curl: 0.15,
      y: 0.0,
      shade: 0.95,
    },
    {
      count: 3,
      length: 0.66,
      width: 0.48,
      open: 0.42,
      closed: 0.04,
      tilt: 0.52,
      curl: 0.12,
      y: 0.01,
      shade: 1.05,
    },
  ],
  daisy: [
    {
      count: 18,
      length: 0.6,
      width: 0.14,
      open: 1.5,
      closed: 0.15,
      tilt: 0.0,
      curl: 0.25,
      y: 0.0,
      shade: 1,
    },
    {
      count: 14,
      length: 0.5,
      width: 0.12,
      open: 1.35,
      closed: 0.12,
      tilt: 0.22,
      curl: 0.2,
      y: 0.02,
      shade: 1.02,
    },
  ],
};

/** A petal: a 2D teardrop, bent backwards along its length and cupped across its width. */
function petalGeometry(length: number, width: number, curl: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 1.05, length * 0.2, width * 0.95, length * 1.02, 0, length);
  shape.bezierCurveTo(-width * 0.95, length * 1.02, -width * 1.05, length * 0.2, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 28);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = y / length;
    const z = curl * t * t * length - 0.35 * (x / width) ** 2 * width;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function Petals({
  kind,
  color,
  stateRef,
}: {
  kind: FlowerKind;
  color: string;
  stateRef: RefObject<BloomState>;
}) {
  const rings = RINGS[kind];
  const groups = useRef<(THREE.Group | null)[]>([]);
  const geos = useMemo(() => rings.map((r) => petalGeometry(r.length, r.width, r.curl)), [rings]);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const petals = useMemo(() => {
    const out: { ring: number; angle: number; key: string }[] = [];
    rings.forEach((r, ri) => {
      for (let i = 0; i < r.count; i++)
        out.push({ ring: ri, angle: (i / r.count) * Math.PI * 2 + r.tilt, key: `${ri}-${i}` });
    });
    return out;
  }, [rings]);

  useFrame(() => {
    const p = ease(stateRef.current?.progress ?? 0);
    petals.forEach((pt, i) => {
      const g = groups.current[i];
      if (!g) return;
      const r = rings[pt.ring];
      // Inner rings lag behind the outer ones so the flower opens from the outside in.
      const local = THREE.MathUtils.clamp((p - pt.ring * 0.12) / (1 - pt.ring * 0.12), 0, 1);
      g.rotation.x = THREE.MathUtils.lerp(r.closed, r.open, local);
    });
  });

  return (
    <group>
      {petals.map((pt, i) => {
        const r = rings[pt.ring];
        const c = base.clone().multiplyScalar(r.shade);
        return (
          <group key={pt.key} rotation={[0, pt.angle, 0]} position={[0, r.y, 0]}>
            <group
              ref={(el) => {
                groups.current[i] = el;
              }}
              rotation={[r.closed, 0, 0]}
            >
              <mesh geometry={geos[pt.ring]}>
                <meshStandardMaterial
                  color={c}
                  side={THREE.DoubleSide}
                  roughness={0.7}
                  metalness={0}
                  emissive={c}
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

function Stem({ kind }: { kind: FlowerKind }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, -2.2, 0),
        new THREE.Vector3(-0.04, -1.4, 0.03),
        new THREE.Vector3(0.03, -0.7, -0.02),
        new THREE.Vector3(0, -0.05, 0),
      ]),
    [],
  );
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.035, 8, false), [curve]);
  const leaf = useMemo(() => petalGeometry(0.55, 0.16, 0.3), []);
  useEffect(
    () => () => {
      geo.dispose();
      leaf.dispose();
    },
    [geo, leaf],
  );
  const green = kind === "daisy" ? "#5f8f4e" : "#4d7a45";
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={green} roughness={0.8} />
      </mesh>
      <mesh geometry={leaf} position={[0.03, -1.2, 0]} rotation={[-Math.PI / 2 + 0.9, 0.3, 0.9]}>
        <meshStandardMaterial color={green} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh geometry={leaf} position={[-0.03, -0.8, 0]} rotation={[-Math.PI / 2 + 1.0, -0.6, -1.1]}>
        <meshStandardMaterial color={green} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* sepals */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh
            geometry={leaf}
            scale={[0.7, 0.45, 0.7]}
            rotation={[-Math.PI / 2 + 1.25, 0, 0]}
            position={[0, -0.05, 0]}
          >
            <meshStandardMaterial color="#3f6a3a" side={THREE.DoubleSide} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pollen({
  color,
  stateRef,
  enabled,
}: {
  color: string;
  stateRef: RefObject<BloomState>;
  enabled: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = 160;
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const rng = mulberry32(11);
    for (let i = 0; i < count; i++) {
      positions.set([(rng() - 0.5) * 2.2, rng() * 2.4 - 0.6, (rng() - 0.5) * 2.2], i * 3);
      speeds[i] = 0.05 + rng() * 0.12;
    }
    return { positions, speeds };
  }, []);
  useFrame((st, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = enabled ? 0.15 + 0.6 * ease(stateRef.current?.progress ?? 0) : 0;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds[i] * dt;
      if (y > 1.8) y = -0.6;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.7 + i) * 0.0008);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={color}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene({
  kind,
  color,
  stateRef,
  pollen,
  reduce,
  onBloomed,
}: {
  kind: FlowerKind;
  color: string;
  stateRef: RefObject<BloomState>;
  pollen: boolean;
  reduce: boolean;
  onBloomed: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  const doneRef = useRef(false);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const state = stateRef.current;
    if (!state) return;
    if (!state.bloomed) {
      if (state.holding) state.progress = Math.min(1, state.progress + d / (reduce ? 0.5 : 3.2));
      if (state.progress >= 1 && !doneRef.current) {
        doneRef.current = true;
        state.bloomed = true;
        onBloomed();
      }
    }
    const g = root.current;
    if (g) {
      g.rotation.y += d * (state.bloomed ? 0.25 : 0.08);
      g.rotation.z = Math.sin(performance.now() / 2600) * 0.03;
    }
  });
  const center = kind === "daisy" ? "#f2c14e" : kind === "tulip" ? color : "#f6d98a";
  return (
    <>
      <hemisphereLight args={["#fff6ec", "#d9b3b3", 1.4]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.5} />
      <directionalLight position={[-3, 1, -2]} intensity={0.7} color="#ffd7c2" />
      <ambientLight intensity={0.35} />
      <group ref={root} position={[0, 0.15, 0]}>
        <Stem kind={kind} />
        <Petals kind={kind} color={color} stateRef={stateRef} />
        <mesh
          position={[0, 0.06, 0]}
          scale={
            kind === "daisy" ? [1.4, 0.7, 1.4] : kind === "tulip" ? [0.6, 0.6, 0.6] : [1, 0.8, 1]
          }
        >
          <sphereGeometry args={[0.12, 24, 16]} />
          <meshStandardMaterial color={center} roughness={0.9} />
        </mesh>
        <Pollen color={color} stateRef={stateRef} enabled={pollen} />
      </group>
    </>
  );
}

export function Flower({
  kind,
  color,
  stateRef,
  pollen,
  reduce,
  onBloomed,
  className,
}: {
  kind: FlowerKind;
  color: string;
  stateRef: RefObject<BloomState>;
  pollen: boolean;
  reduce: boolean;
  onBloomed: () => void;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.05, 3.5], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0.1, 0);
      }}
    >
      <Scene
        kind={kind}
        color={color}
        stateRef={stateRef}
        pollen={pollen}
        reduce={reduce}
        onBloomed={onBloomed}
      />
    </Canvas>
  );
}
