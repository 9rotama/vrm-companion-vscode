import { vscode } from "./utilities/vscode";
import "./App.css";

function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h1>Hello World!</h1>
      <button className="bg-slate-950 font-bold" onClick={handleHowdyClick}>
        Howdy!
      </button>
    </main>
  );
}

export default App;
