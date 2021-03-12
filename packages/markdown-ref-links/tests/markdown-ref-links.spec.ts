import remark from 'remark';
import { format } from '../src/markdown-ref-links';
import fs from 'fs';
import { join, extname } from 'path';

test('fixtures with default settings', () => {
  const root = join(__dirname, 'fixtures');
  // https://github.com/remarkjs/remark-reference-links/blob/main/test.js
  fs.readdirSync(root)
    .filter((name) => extname(name) === '.md')
    .forEach((name) => {
      const input = fs.readFileSync(join(root, name));
      const actual = format(input.toString());
      expect(actual).toMatchSnapshot();
    });
});
