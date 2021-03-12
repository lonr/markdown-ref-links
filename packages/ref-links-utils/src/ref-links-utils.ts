import visit from 'unist-util-visit';
import { Outline, Section } from './tree';
export { Outline, Section };
import type { Root, Link, Image, Definition, Heading } from 'mdast';
import type { WithParent } from 'unist-util-parents';

export function genOutline(root: WithParent<Root>): Outline {
  const outline = new Outline(root);
  let lastSection: Section | Outline = outline;

  for (const child of root.children) {
    if (child.type === 'heading') {
      if (child.depth > outline.maxDepth) {
        outline.maxDepth = child.depth;
      }
      let p: Outline | Section = outline;
      for (let depth = 0; depth < child.depth; depth += 1) {
        if (p.children.length === 0) {
          break;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const lastChild: Section = p.lastChild!;
          if (lastChild.heading.depth < child.depth) {
            p = lastChild;
          }
        }
      }
      lastSection = new Section(child as WithParent<Heading>);
      p.children.push(lastSection);
    } else {
      lastSection.introEnd = child;
    }

    visit(
      child,
      ['image', 'link'],
      (node: WithParent<Image> | WithParent<Link>) => {
        if (node.type === 'link') {
          lastSection.links.push(node);
        } else if (node.type === 'image') {
          lastSection.images.push(node);
        }
      }
    );
  }

  // https://github.com/remarkjs/remark-reference-links/blob/f14a49794590a3d3e97f65deabd82ad5e8725dc3/index.js#L22
  visit(root, 'definition', (definition: WithParent<Definition>) => {
    const url = definition.url;
    const definitions = outline.definitions;
    outline.existing.push(definition.identifier);
    if (!(url in definitions)) {
      definitions[url] = {};
    }
    definitions[url][definition.title ?? ''] = definition;
  });

  return outline;
}
