import type { Heading, Link, Image, Definition } from 'mdast';
import type { Node } from 'unist';
import type { WithParent } from 'unist-util-parents';

export class Section {
  heading: WithParent<Heading>;
  introEnd: WithParent<Node>;
  images: WithParent<Image>[];
  links: WithParent<Link>[];
  children: Section[];

  constructor(heading: WithParent<Heading>) {
    this.heading = heading;
    this.introEnd = heading;
    this.images = [];
    this.links = [];
    this.children = [];
  }

  get lastChild(): Section | undefined {
    return this.hasChildren
      ? this.children[this.children.length - 1]
      : undefined;
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  get outroEnd(): WithParent<Node> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.hasChildren ? this.lastChild!.outroEnd : this.introEnd;
  }
}

export class Outline {
  maxDepth = 0;
  /// just to keep similar structure with Section
  introEnd: WithParent<Node>;
  images: WithParent<Image>[];
  links: WithParent<Link>[];
  definitions: Record<string, Record<string, Definition>>;
  existing: string[];
  children: Section[] = [];
  constructor(end: WithParent<Node>) {
    this.introEnd = end;
    this.images = [];
    this.links = [];
    this.definitions = {};
    this.existing = [];
  }
  get hasChildren(): boolean {
    return this.children.length > 0;
  }
  get lastChild(): Section | undefined {
    return this.hasChildren
      ? this.children[this.children.length - 1]
      : undefined;
  }
}
