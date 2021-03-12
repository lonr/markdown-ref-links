// eslint is broken on these two rules?
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// (The MIT License)
// Copyright (c) 2015 Titus Wormer <tituswormer@gmail.com>
// https://github.com/remarkjs/remark-reference-links/blob/main/index.js


// import { genOutline, Section } from '../../ref-links-utils/src/ref-links-utils';
import { genOutline, Section } from '@lonr/ref-links-utils';
import parents, { WithParent } from 'unist-util-parents';
import type { Plugin, Settings } from 'unified';
import type { Node } from 'unist';
import type {
  Root,
  Definition,
  LinkReference,
  ImageReference,
  Image,
  Link,
} from 'mdast';

const refLinks: Plugin = function attacher(userSettings) {
  const settings = {
    ...{ maxDepth: -1, allDuplicate: false },
    ...userSettings,
  };

  return function transformer(tree, file) {
    let id = 0;
    const root = parents(tree as Root);
    const outline = genOutline(root);
    const { definitions, existing } = outline;
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

    /**
     * traverse sections and replace links and images
     * @param {Section} section
     * @param {WithParent<Node>} insertAnchor used if a section need to insert defs after it's ancestor's outroEnd
     */
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
      // node is at least a child of root
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parent = node.parent!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const index = node.parent!.children.indexOf(node);
      parent.node.children[index] = newNode;
    }

    function insertAfter(node: WithParent<Node>, newNode: Node) {
      // root!
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parent = node.parent!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let index = node.parent!.children.indexOf(node);
      // fix the inserting order
      do {
        index += 1;
      } while (
        index < parent.node.children.length &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parent.node.children[index]!.type !== 'heading'
      );
      parent.node.children.splice(index, 0, newNode);
    }
  };
};

export default refLinks;
