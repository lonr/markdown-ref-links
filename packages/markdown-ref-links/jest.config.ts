import { resolve } from 'path';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@lonr/ref-links-utils$': resolve(
      __dirname,
      '../ref-links-utils/src/ref-links-utils'
    ),
  },
};
