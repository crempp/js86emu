// Browser filesystem configuration
// https://github.com/jvilk/BrowserFS
const FS_CONFIG = {
  fs: "MountableFileSystem",
  options: {
    "/files": {
      fs: "HTTPRequest",
      options: {
        index: "/files/fs.json",
        baseUrl: "/files"
      }
    },
    "/tmp": {
      fs: "LocalStorage"
    },
  }
};

export default FS_CONFIG;