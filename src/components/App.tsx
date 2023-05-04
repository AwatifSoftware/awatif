import { Editor } from "./Editor/Editor";
import { Layouter } from "./Layouter/Layouter";

export function App() {
  return (
    <Layouter>
      <Editor text="Here is text as an example"></Editor>
      <div>ModelConfigurator</div>
      <div>Viewer</div>
    </Layouter>
  );
}
