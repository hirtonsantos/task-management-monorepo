const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  externals: [
    nodeExternals({
      // Inclui os packages do workspace no bundle
      allowlist: [
        '@task-app/database',
        '@task-app/shared',
        '@task-app/config',
        '@task-app/utils',
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@task-app/database': path.resolve(__dirname, '../../packages/database/src'),
      '@task-app/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@task-app/config': path.resolve(__dirname, '../../packages/config/src'),
      '@task-app/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
};