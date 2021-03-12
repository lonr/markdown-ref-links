// https://code.visualstudio.com/api/references/vscode-api#Position
// https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/core/range.ts
// https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostTypes.ts

export class Position {
  private _line: number;
  private _character: number;

  get line(): number {
    return this._line;
  }

  get character(): number {
    return this._character;
  }

  constructor(line: number, character: number) {
    this._line = line;
    this._character = character;
  }

  translate(lineDelta = 0, characterDelta = 0): Position {
    return new Position(this.line + lineDelta, this.character + characterDelta);
  }
}

export class Range {
  private _start: Position;
  private _end: Position;

  get start(): Position {
    return this._start;
  }

  get end(): Position {
    return this._end;
  }

  constructor(start: Position, end: Position) {
    this._start = new Position(start.line, start.character);
    this._end = new Position(end.line, end.character);
  }

  with(start: Position = this.start, end: Position = this.end): Range {
    return new Range(start, end);
  }
}

export class TextEdit {
  static replace(range: Range, newText: string): TextEdit {
    return new TextEdit(range, newText);
  }

  static insert(position: Position, newText: string): TextEdit {
    return TextEdit.replace(new Range(position, position), newText);
  }

  private _range: Range;
  private _newText: string | null;

  constructor(range: Range, newText: string | null) {
    this._range = range;
    this._newText = newText;
  }

  get newText(): string {
    return this._newText || '';
  }
  get range(): Range {
    return this._range;
  }
}
