#!/usr/bin/env node
/**
 * Script to prepare files for Lambda deployment
 * Copies handler and dependencies to root for proper module resolution
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const backendDist = path.join(rootDir, 'backend', 'dist');

// Files and folders to copy
const filesToCopy = [
  { src: 'index.serverless.js', dest: 'index.js' },
  { src: 'handlers', dest: 'handlers' },
  { src: 'services', dest: 'services' },
  { src: 'utils', dest: 'utils' }
];

console.log('Preparing Lambda deployment files...');

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(backendDist, src);
  const destPath = path.join(rootDir, dest);
  
  if (fs.existsSync(srcPath)) {
    // Remove existing destination
    if (fs.existsSync(destPath)) {
      if (fs.statSync(destPath).isDirectory()) {
        fs.rmSync(destPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(destPath);
      }
    }
    
    // Copy file or directory
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`✓ Copied directory: ${src} -> ${dest}`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied file: ${src} -> ${dest}`);
    }
  } else {
    console.warn(`⚠ Source not found: ${srcPath}`);
  }
});

console.log('✓ Lambda deployment files prepared');

