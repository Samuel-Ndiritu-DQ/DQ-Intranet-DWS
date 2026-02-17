#!/usr/bin/env node

/**
 * Helper script to verify glossary images are in place
 * 
 * To add the images:
 * 1. Save the D6 (Digital Accelerators - Tools) diagram as: public/images/knowledge/6xd.png
 * 2. Save the Golden Honeycomb diagram as: public/images/knowledge/ghc.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageDir = path.join(__dirname, '..', 'public', 'images', 'knowledge');
const requiredImages = ['6xd.png', 'ghc.png'];

console.log('📸 Checking glossary images...\n');

// Ensure directory exists
if (!fs.existsSync(imageDir)) {
  console.log(`❌ Directory not found: ${imageDir}`);
  console.log(`📁 Creating directory...`);
  fs.mkdirSync(imageDir, { recursive: true });
  console.log(`✅ Directory created\n`);
}

// Check for required images
let allFound = true;
requiredImages.forEach(image => {
  const imagePath = path.join(imageDir, image);
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log(`✅ ${image} found (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${image} NOT FOUND`);
    console.log(`   Expected location: ${imagePath}`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allFound) {
  console.log('✅ All images are in place!');
} else {
  console.log('⚠️  Some images are missing.');
  console.log('\nTo add the images:');
  console.log('1. Save the D6 (Digital Accelerators - Tools) diagram as: public/images/knowledge/6xd.png');
  console.log('2. Save the Golden Honeycomb diagram as: public/images/knowledge/ghc.png');
}
console.log('='.repeat(50));

