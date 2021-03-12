declare module 'unist-util-parents' {
  import type { Node, Parent } from 'unist';
  type WithParent<T extends Node> = {
    [K in keyof T]: T[K] extends Node[] ? WithParent<T[K][number]>[] : T[K];
  } & {
    parent: WithParent<Parent> | null;
    node: T;
  };

  export default function parents<T extends Node>(tree: T): WithParent<T>;
}
