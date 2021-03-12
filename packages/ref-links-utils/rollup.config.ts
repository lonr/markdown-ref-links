import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';


export default [
  {
    input: 'src/remark-ref-links.ts',
    output: [
      {
        file: pkg.exports.require,
        name: 'remark-ref-links',
        format: 'umd',
        sourcemap: true,
      },
      { file: pkg.exports.import, format: 'es', sourcemap: true },
    ],
    plugins: [typescript({ tsconfig: 'tsconfig.build.json' })],
  },
  {
    // using d.ts files generated by ⬆️
    input: 'dist/remark-ref-links.d.ts',
    output: { file: pkg.types },
    plugins: [dts()],
  },
];
