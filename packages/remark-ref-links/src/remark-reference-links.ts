// (The MIT License)
// Copyright (c) 2015 Titus Wormer <tituswormer@gmail.com>
// https://github.com/remarkjs/remark-reference-links/blob/main/index.js

import visit from 'unist-util-visit';
import type { ActionTuple } from 'unist-util-visit-parents';
import type { Plugin } from 'unified';
import type { Node, Parent } from 'unist';

// https://dev.to/aman_singh/what-s-the-deal-with-object-prototype-hasownproperty-call-4mbj
// eslint-disable-next-line @typescript-eslint/unbound-method
const own: (this: unknown, v: PropertyKey) => boolean = {}.hasOwnProperty;

const referenceLinks: Plugin = function attacher() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function transformer(tree, file) {
    let id = 0;
    const definitions: {
      [url: string]: {
        [title: string]: Node;
      };
    } = {};
    const existing: string[] = [];

    visit(tree, 'definition', find);
    visit(tree, ['image', 'link'], replace);
    // Find existing definitions.
    function find(node: Node) {
      const url = node.url as string ;

      existing.push(node.identifier as string );

      if (!own.call(definitions, url)) {
        definitions[url] = {};
      }

      // buggy here
      definitions[url][node.title as string] = node;
    }

    // Transform normal links and images into references and definitions, replaces
    // the current node, and adds a definition if needed.
    function replace(node: Node, index: number, parent: Parent | undefined) {
      const url = node.url as string;
      // buggy here
      const title = node.title as string;
      let replacement: Node;
      let identifier;
      let titles;
      let definition;

      if (own.call(definitions, url)) {
        titles = definitions[url];
      } else {
        titles = {};
        definitions[url] = titles;
      }

      if (own.call(titles, title)) {
        identifier = titles[title].identifier;
      } else {
        do {
          identifier = String(++id);
        } while (existing.indexOf(identifier) !== -1);

        definition = {
          type: 'definition',
          identifier: identifier,
          title: title,
          url: url,
        };

        titles[title] = definition;

        (tree.children as Node[]).push(definition);
      }

      // eslint-disable-next-line prefer-const
      replacement = {
        type: node.type + 'Reference',
        identifier: identifier,
        referenceType: 'full',
      };

      if (node.type === 'image') {
        replacement.alt = node.alt;
      } else {
        replacement.children = node.children;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parent!.children[index] = replacement;
      return [visit.SKIP, index] as ActionTuple;
    }
  };
};

export default referenceLinks;
