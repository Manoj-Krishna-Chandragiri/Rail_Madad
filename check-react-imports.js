const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define directories to check
const directories = [
  './frontend/src',
  './admin/src'
];

// Function to check if a file contains JSX but no React import
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains JSX
    const hasJSX = /<[A-Z][A-Za-z]*/.test(content) || 
                  /<[a-z]+(\s+[a-zA-Z]+=)/.test(content);
    
    // Check if file contains React import
    const hasReactImport = /import\s+React/.test(content);
    
    // Return results
    if (hasJSX && !hasReactImport) {
      return {
        path: filePath,
        needsImport: true
      };
    }
    return null;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

// Process all TypeScript and TSX files
let filesWithIssues = [];
directories.forEach(dir => {
  const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
  
  files.forEach(file => {
    const result = checkFile(file);
    if (result) {
      filesWithIssues.push(result);
    }
  });
});

// Output results
if (filesWithIssues.length > 0) {
  console.log('The following files contain JSX but no React import:');
  filesWithIssues.forEach(file => {
    console.log(`- ${file.path}`);
  });
  console.log('\nAdd the following line at the top of each file:');
  console.log('import React from \'react\';');
} else {
  console.log('All files contain proper React imports!');
}
