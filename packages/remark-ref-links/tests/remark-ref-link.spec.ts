import remark from 'remark';
import refLinks from '../src/remark-ref-links';
import fs from 'fs';
import { join, extname } from 'path';

test.only('fixtures with default settings', () => {
  const root = join(__dirname, 'fixtures');
  // https://github.com/remarkjs/remark-reference-links/blob/main/test.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const actual = remark().use(refLinks).processSync(input).toString();
      expect(actual).toMatchSnapshot();
    });
});

test('fixtures with settings {allDuplicate: true}', () => {
  const root = join(__dirname, 'fixtures');
  // https://github.com/remarkjs/remark-reference-links/blob/main/test.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const actual = remark()
        .use(refLinks, { allDuplicate: true })
        .processSync(input)
        .toString();
      expect(actual).toMatchSnapshot();
    });
});

test('fixtures with settings {maxDepth: 0}', () => {
  const root = join(__dirname, 'fixtures');
  // https://github.com/remarkjs/remark-reference-links/blob/main/test.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const actual = remark()
        .use(refLinks, { maxDepth: 0 })
        .processSync(input)
        .toString();
      expect(actual).toMatchSnapshot();
    });
});

test('fixtures with settings {maxDepth: 2}', () => {
  const root = join(__dirname, 'fixtures');
  // https://github.com/remarkjs/remark-reference-links/blob/main/test.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const actual = remark()
        .use(refLinks, { maxDepth: 2 })
        .processSync(input)
        .toString();
      expect(actual).toMatchSnapshot();
    });
});
