/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // Bundle the api stub (which references the global joplin object)
    // rather than emitting require('api'), which doesn't exist in Joplin's sandbox.
    alias: {
      api: path.resolve(__dirname, 'api/index.js'),
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    // No libraryTarget — plugin registers itself as a side effect inside the IIFE.
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/contentScript.js', to: 'contentScript.js' },
        { from: 'manifest.json', to: 'manifest.json' },
      ],
    }),
  ],
};
