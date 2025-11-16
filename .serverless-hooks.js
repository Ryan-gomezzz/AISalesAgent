// Serverless hooks to prepare files for packaging
module.exports = {
  'before:package:createDeploymentArtifacts': async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Copy backend/dist to dist
    const srcDir = path.join(__dirname, 'backend', 'dist');
    const destDir = path.join(__dirname, 'dist');
    
    if (fs.existsSync(srcDir)) {
      // Remove existing dist if it exists
      if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      // Copy dist
      fs.cpSync(srcDir, destDir, { recursive: true });
      console.log('Copied backend/dist to dist for packaging');
    }
    
    // Copy backend/node_modules to node_modules (selective)
    const srcNodeModules = path.join(__dirname, 'backend', 'node_modules');
    const destNodeModules = path.join(__dirname, 'node_modules');
    
    if (fs.existsSync(srcNodeModules)) {
      // Only copy specific packages we need
      const packagesToCopy = ['@aws-sdk', 'serverless-http', 'uuid', 'express', 'cors', 'dotenv'];
      packagesToCopy.forEach(pkg => {
        const srcPkg = path.join(srcNodeModules, pkg);
        const destPkg = path.join(destNodeModules, pkg);
        if (fs.existsSync(srcPkg)) {
          if (fs.existsSync(destPkg)) {
            fs.rmSync(destPkg, { recursive: true, force: true });
          }
          fs.cpSync(srcPkg, destPkg, { recursive: true });
        }
      });
      console.log('Copied required node_modules for packaging');
    }
  },
  
  'after:package:createDeploymentArtifacts': async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Clean up copied files
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir) && fs.statSync(distDir).isDirectory()) {
      // Only remove if it's the one we created (check if it has our files)
      const indexFile = path.join(distDir, 'index.serverless.js');
      if (fs.existsSync(indexFile)) {
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log('Cleaned up temporary dist directory');
      }
    }
  }
};

