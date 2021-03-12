/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { genOutline, Outline, Section } from '@lonr/ref-links-utils';
import parents, { WithParent } from 'unist-util-parents';
import unified from 'unified';
import type { Node } from 'unist';
import type {
  Root,
  Heading,
  Link,
  Image,
  Definition,
  LinkReference,
  ImageReference,
} from 'mdast';
import remarkParse from 'remark-parse';
import toMarkdown from 'mdast-util-to-markdown';
import { Position, Range, TextEdit } from './edit';

export function format(
  markdown: string,
  userSettings?: { maxDepth?: number; allowDuplicate?: boolean }
): string {
  const settings = {
    ...{ maxDepth: -1, allDuplicate: false },
    ...userSettings,
  };
  const processor = unified().use(remarkParse);
  const root = parents(processor.parse(markdown) as Root);
  const outline = genOutline(root);
  const { definitions, existing } = outline;
  const edits: TextEdit[] = [];
  let id = 0;
  settings.maxDepth =
    settings.maxDepth >= 0
      ? settings.maxDepth
      : outline.maxDepth + settings.maxDepth + 1;

  const topInsertAnchor = root.children[root.children.length - 1];
  // handles Markdown with no headers or multiple h1 headers
  const outlineInsertAnchor =
    outline.hasChildren && settings.maxDepth !== 0
      ? outline.introEnd
      : topInsertAnchor;

  for (const linkOrImage of [...outline.links, ...outline.images]) {
    // if root has no children, it should have no links too
    convert(linkOrImage, outlineInsertAnchor);
  }

  const sectionsInsertAnchor =
    settings.maxDepth === 0 ? outlineInsertAnchor : undefined;

  for (const section of outline.children) {
    traverseSection(section, sectionsInsertAnchor);
  }

  return markdown;

  function traverseSection(
    section: Section,
    insertAnchor?: WithParent<Node>
  ): void {
    const links = section.links;
    const images = section.images;
    const underMaxDepth = section.heading.depth < settings.maxDepth;
    const sectionInsertAnchor =
      insertAnchor ?? (underMaxDepth ? section.introEnd : section.outroEnd);

    for (const linkOrImage of [...links, ...images]) {
      convert(linkOrImage, sectionInsertAnchor);
    }

    const childrenInsertAnchor =
      insertAnchor ?? (underMaxDepth ? undefined : section.outroEnd);

    for (const child of section.children) {
      traverseSection(child, childrenInsertAnchor);
    }
  }

  function convert(
    linkOrImage: WithParent<Link | Image>,
    insertAnchor: WithParent<Node>
  ) {
    // eslint-disable-next-line prefer-const
    let { type, url, title } = linkOrImage;
    title ??= '';
    let titles: Record<string, Definition> = {};
    let identifier: string;

    let definitionExisted = false;

    if (url in definitions) {
      titles = definitions[url];
    } else {
      definitions[url] = titles;
    }

    if (title in titles) {
      identifier = titles[title].identifier;
      definitionExisted = true;
    } else {
      do {
        identifier = `${++id}`;
      } while (existing.includes(identifier));
    }

    const definition: Definition = {
      type: 'definition',
      identifier: identifier,
      title,
      url: url,
    };

    titles[title] = definition;
    if (!definitionExisted || settings.allDuplicate) {
      insertAfter(insertAnchor, definition);
    }

    const replacement: LinkReference | ImageReference = {
      type: `${type}Reference` as const,
      identifier: identifier,
      referenceType: 'full',
    } as LinkReference | ImageReference;

    if (type === 'link') {
      replacement.children = linkOrImage.node.children;
    } else if (type === 'image') {
      replacement.alt = linkOrImage.node.alt;
    }
    replace(linkOrImage, replacement);
  }

  function replace(node: WithParent<Node>, newNode: Node) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let { line, column } = node.position!.start;
    const start = new Position(line - 1, column - 1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ({ line, column } = node.position!.end);
    const end = new Position(line - 1, column - 1);
    const range = new Range(start, end);
    const newText = toMarkdown(newNode);
    edits.push(TextEdit.replace(range, newText))
  }

  function insertAfter(node: WithParent<Node>, newNode: Node) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { line } = node.position!.start;
    // const position = new Position(line - 1 + 1, 0);
    const position = new Position(line, 0);
    const newText = toMarkdown(newNode);
    edits.push(TextEdit.insert(position, newText));
  }

}
