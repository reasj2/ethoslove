"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { mulberry32 } from "../_shared/random";

export type Place = { name: string; lat: number; lng: number };
export type FlightState = { progress: number; arrived: boolean; started: boolean };

const R = 1;

export function latLngToVec3(lat: number, lng: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  const omega = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  if (omega < 1e-4) return a.clone();
  const s = Math.sin(omega);
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / s));
}

/** Great-circle route through every place, lifted off the surface in the middle of each leg. */
export function buildRoute(places: Place[]) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < places.length - 1; i++) {
    const a = latLngToVec3(places[i].lat, places[i].lng).normalize();
    const b = latLngToVec3(places[i + 1].lat, places[i + 1].lng).normalize();
    const omega = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    const lift = 0.06 + 0.32 * (omega / Math.PI);
    const n = 48;
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const t = k / n;
      pts.push(slerp(a, b, t).multiplyScalar(R + lift * Math.sin(Math.PI * t)));
    }
  }
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

function graticule() {
  const seg: number[] = [];
  const push = (v: THREE.Vector3) => seg.push(v.x, v.y, v.z);
  const N = 72;
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let i = 0; i < N; i++) {
      push(latLngToVec3(lat, (i / N) * 360 - 180, R + 0.001));
      push(latLngToVec3(lat, ((i + 1) / N) * 360 - 180, R + 0.001));
    }
  }
  for (let lng = -180; lng < 180; lng += 15) {
    for (let i = 0; i < N; i++) {
      push(latLngToVec3((i / N) * 180 - 90, lng, R + 0.001));
      push(latLngToVec3(((i + 1) / N) * 180 - 90, lng, R + 0.001));
    }
  }
  return new Float32Array(seg);
}

function starField(count = 600) {
  const arr = new Float32Array(count * 3);
  const rng = mulberry32(7);
  for (let i = 0; i < count; i++) {
    const u = rng() * 2 - 1;
    const theta = rng() * Math.PI * 2;
    const r = 14 + rng() * 10;
    const s = Math.sqrt(1 - u * u);
    arr.set([r * s * Math.cos(theta), r * u, r * s * Math.sin(theta)], i * 3);
  }
  return arr;
}

export type GlobePalette = {
  globe: string;
  lines: string;
  equator: string;
  accent: string;
  stars: boolean;
};

function Scene({
  places,
  stateRef,
  palette,
  reduce,
  onArrive,
  autoRotate,
}: {
  places: Place[];
  stateRef: RefObject<FlightState>;
  palette: GlobePalette;
  reduce: boolean;
  onArrive: () => void;
  autoRotate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const tube = useRef<THREE.Mesh>(null);
  const plane = useRef<THREE.Mesh>(null);
  const arrivedRef = useRef(false);
  const curve = useMemo(() => buildRoute(places), [places]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.007, 6, false), [curve]);
  const lines = useMemo(() => graticule(), []);
  const stars = useMemo(() => starField(), []);
  const pins = useMemo(() => places.map((p) => latLngToVec3(p.lat, p.lng, R + 0.004)), [places]);
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const up = useMemo(() => new THREE.Vector3(0, 0.2, 1).normalize(), []);

  useEffect(() => () => tubeGeo.dispose(), [tubeGeo]);

  useFrame((_, dt) => {
    const g = group.current;
    const state = stateRef.current;
    if (!g || !state) return;
    const d = Math.min(dt, 0.05);
    if (state.started && !state.arrived) {
      state.progress = Math.min(1, state.progress + d / (reduce ? 0.6 : 7));
      if (state.progress >= 1 && !arrivedRef.current) {
        arrivedRef.current = true;
        state.arrived = true;
        onArrive();
      }
    }
    const p = state.progress;
    if (tube.current)
      tube.current.geometry.setDrawRange(0, Math.floor(Math.max(0.002, p) * 240) * 36 || 0);
    const pos = curve.getPointAt(Math.min(0.999, Math.max(0.001, p)));
    if (plane.current) {
      plane.current.position.copy(pos);
      plane.current.visible = p > 0 && p < 1;
    }
    // Turn the globe so the plane stays in front of the camera; drift when idle.
    const dir = pos.clone().normalize();
    tmpQ.setFromUnitVectors(dir, up);
    g.quaternion.slerp(tmpQ, state.arrived ? 0.02 : 0.06);
    if (autoRotate && state.arrived) g.rotateY(d * 0.12);
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      {palette.stars ? (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
        </points>
      ) : null}
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color={palette.globe} roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh scale={1.035}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial
            color={palette.accent}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={palette.lines} transparent opacity={0.55} />
        </lineSegments>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R + 0.002, 0.0025, 6, 128]} />
          <meshBasicMaterial color={palette.equator} transparent opacity={0.7} />
        </mesh>
        <mesh ref={tube} geometry={tubeGeo}>
          <meshBasicMaterial color={palette.accent} />
        </mesh>
        {pins.map((v, i) => (
          <group key={i} position={v}>
            <mesh>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshBasicMaterial
                color={i === 0 || i === pins.length - 1 ? palette.accent : "#ffffff"}
              />
            </mesh>
            <mesh
              lookAt={undefined}
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                v.clone().normalize(),
              )}
            >
              <ringGeometry args={[0.03, 0.036, 32]} />
              <meshBasicMaterial
                color={palette.accent}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
        <mesh ref={plane} visible={false}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
}

/** Pulls the camera back on portrait screens so the whole globe stays in frame. */
function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = (cam.fov * Math.PI) / 360;
    cam.position.set(0, 0.3, aspect < 1 ? 1.08 / (aspect * Math.tan(halfFov)) : 2.9);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export function Globe({
  places,
  stateRef,
  palette,
  reduce,
  onArrive,
  autoRotate = true,
  className,
}: {
  places: Place[];
  stateRef: RefObject<FlightState>;
  palette: GlobePalette;
  reduce: boolean;
  onArrive: () => void;
  autoRotate?: boolean;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 2.75], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <CameraRig />
      <Scene
        places={places}
        stateRef={stateRef}
        palette={palette}
        reduce={reduce}
        onArrive={onArrive}
        autoRotate={autoRotate}
      />
    </Canvas>
  );
}
