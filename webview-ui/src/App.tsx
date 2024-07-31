import { vscode } from "./utilities/vscode";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function Model() {
  const gltf = useGLTF("/test_models/VRM_NekoUmiushi.vrm");

  return (
    <mesh rotation={[0, Math.PI, 0]} scale={[5, 5, 5]} position={[0, -3, 0]}>
      <primitive object={gltf.scene} />
    </mesh>
  );
}

function App() {
  return (
    <main className="w-screen h-screen">
      <div className="font-bold text-pink-600">vrm companion test</div>
      <Canvas>
        <ambientLight intensity={5} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </main>
  );
}

export default App;
