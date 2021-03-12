/*eslint-env browser*/
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import refLinks from '@lonr/remark-ref-links';
import remark from 'remark';

const inputModel = monaco.editor.createModel(
  '# Hello\n\n[hello](https://example.com)\n'
);
const outputModel = monaco.editor.createModel(
  remark().use(refLinks).processSync(inputModel.getValue()).toString()
);

const diffEditor = monaco.editor.createDiffEditor(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.getElementById('container')!,
  {
    automaticLayout: true,
    originalEditable: true, // for left pane
    readOnly: true, // for right pane
  }
);

diffEditor.setModel({
  original: inputModel,
  modified: outputModel,
});

inputModel.onDidChangeContent(
  debounce(() => {
    const input = inputModel.getValue();
    const output = remark().use(refLinks).processSync(input).toString();
    outputModel.setValue(output);
  }, 1000)
);

function debounce(func: () => void, wait = 0) {
  let id: number | undefined;

  return () => {
    console.log();

    if (id !== undefined) {
      clearTimeout(id);
    }
    id = window.setTimeout(func, wait);
  };
}
