import unified from 'unified';
import remarkParse from 'remark-parse';
import fs from 'fs';
import { join, extname } from 'path';
import { genOutline } from '../src/ref-links-utils';
import type { Root, Heading, Link, Image } from 'mdast';
import parents, { WithParent } from 'unist-util-parents';

test('fixtures', () => {
  const root = join(__dirname, 'fixtures');

  // https://github.com/syntax-tree/mdast-util-toc/blob/main/test/index.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const processor = unified().use(remarkParse);
      const actual = genOutline(parents(processor.parse(input) as Root));
      expect(actual).toMatchSnapshot();
    });
});
