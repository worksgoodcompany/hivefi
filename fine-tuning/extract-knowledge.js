#!/usr/bin/env node

import pdf2md from '@opendocsg/pdf2md';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config();

const DOCS_DIR = './docs';
const OUTPUT_DIR = './output';
const CHARACTERS_DIR = './characters';

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(CHARACTERS_DIR, { recursive: true });
}

function cleanText(text) {
  return text
    .replace(/\[.*?\]/g, '')                        // Remove markdown links
    .replace(/\(.*?\)/g, '')                        // Remove markdown link URLs
    .replace(/`.*?`/g, '')                          // Remove code blocks
    .replace(/\s+/g, ' ')                           // Normalize whitespace
    .replace(/\n/g, ' ')                            // Remove newlines
    .replace(/\r/g, '')                             // Remove carriage returns
    .replace(/\t/g, ' ')                            // Replace tabs with spaces
    .trim();                                        // Trim whitespace
}

function isInformativeChunk(chunk) {
  // Filter out non-informative chunks
  if (chunk.length < 50) return false;                              // Too short
  if (chunk.length > 500) return false;                            // Too long
  if (/^(see|refer to|check|visit|click|follow)/i.test(chunk)) return false;  // Navigation instructions
  if (/^(note|warning|info|tip):/i.test(chunk)) return false;      // Notes and warnings
  if (chunk.includes('```')) return false;                         // Code blocks
  if (chunk.match(/[A-Za-z]/g)?.length < 20) return false;        // Not enough letters
  return true;
}

// Process a single document
async function processDocument(filePath) {
  console.log(`Processing file: ${filePath}`);
  let content;
  const fileExtension = path.extname(filePath).toLowerCase();

  try {
    if (fileExtension === '.pdf') {
      const buffer = await fs.readFile(filePath);
      const uint8Array = new Uint8Array(buffer);
      content = await pdf2md(uint8Array);
    } else {
      content = await fs.readFile(filePath, 'utf8');
    }

    // Split into paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    const chunks = [];
    
    for (const paragraph of paragraphs) {
      // Skip empty paragraphs
      if (!paragraph.trim()) continue;

      // Clean and split into sentences
      const cleanedText = cleanText(paragraph);
      const sentences = cleanedText
        .split(/(?<=[.!?])\s+/g)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Process each sentence
      for (const sentence of sentences) {
        if (sentence && isInformativeChunk(sentence)) {
          chunks.push(sentence);
        }
      }
    }

    return {
      document: content,
      chunks: chunks.filter(chunk => chunk.length > 0),
      metadata: {
        filename: path.basename(filePath),
        type: fileExtension.slice(1),
        processedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Find and process all files in a directory
async function findAndProcessFiles(dirPath) {
  try {
    const filesAndDirectories = await fs.readdir(dirPath, { withFileTypes: true });
    const documents = [];
    const chunks = [];

    for (const dirent of filesAndDirectories) {
      const fullPath = path.join(dirPath, dirent.name);
      
      if (dirent.isDirectory()) {
        const { docs, chks } = await findAndProcessFiles(fullPath);
        documents.push(...docs);
        chunks.push(...chks);
      } else if (dirent.isFile()) {
        const result = await processDocument(fullPath);
        if (result) {
          documents.push(result.document);
          chunks.push(...result.chunks);
        }
      }
    }

    return { docs: documents, chks: chunks };
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    return { docs: [], chks: [] };
  }
}

// Generate character knowledge files
async function generateCharacterKnowledge(documents, chunks) {
  const knowledge = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalDocuments: documents.length,
      totalChunks: chunks.length
    },
    documents: documents,
    chunks: chunks
  };

  // Save complete knowledge base
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'knowledge.json'),
    JSON.stringify(knowledge, null, 2)
  );

  // Create individual character files
  const characterTemplate = {
    metadata: knowledge.metadata,
    knowledge: chunks
  };

  await fs.writeFile(
    path.join(CHARACTERS_DIR, 'character-template.json'),
    JSON.stringify(characterTemplate, null, 2)
  );

  console.log('Knowledge base and character template generated successfully!');
}

// Main function
async function main() {
  try {
    await ensureDirectories();

    console.log('Starting knowledge extraction process...');
    console.log(`Reading documents from: ${DOCS_DIR}`);

    const { docs, chks } = await findAndProcessFiles(DOCS_DIR);
    
    if (docs.length === 0) {
      console.log('No documents found to process. Please add documents to the docs directory.');
      return;
    }

    console.log(`Processed ${docs.length} documents with ${chks.length} chunks`);
    await generateCharacterKnowledge(docs, chks);

    console.log('\nProcess completed successfully!');
    console.log(`Output files can be found in:`);
    console.log(`- Complete knowledge base: ${path.join(OUTPUT_DIR, 'knowledge.json')}`);
    console.log(`- Character template: ${path.join(CHARACTERS_DIR, 'character-template.json')}`);
  } catch (error) {
    console.error('Error during knowledge extraction:', error);
    process.exit(1);
  }
}

// Execute the main function
main(); 