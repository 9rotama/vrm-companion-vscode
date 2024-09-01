import Model from "./components/Model";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export default function App() {
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
