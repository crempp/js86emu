module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config

    // Use BrowserFS versions of Node modules.
    config.resolve.alias['fs'] = 'browserfs/dist/shims/fs.js'
    config.resolve.alias['buffer'] = 'browserfs/dist/shims/buffer.js'
    config.resolve.alias['path'] = 'browserfs/dist/shims/path.js'
    config.resolve.alias['processGlobal'] = 'browserfs/dist/shims/process.js'
    config.resolve.alias['bufferGlobal'] = 'browserfs/dist/shims/bufferGlobal.js'
    config.resolve.alias['bfsGlobal'] = require.resolve('browserfs')

    config.plugins.push(
      new webpack.ProvidePlugin({
        BrowserFS: 'bfsGlobal',
        process: 'processGlobal',
        Buffer: 'bufferGlobal'
      })
    );

    config.node['process'] = false;
    config.node['Buffer'] = false;

    // Important: return the modified config
    return config
  },
};
