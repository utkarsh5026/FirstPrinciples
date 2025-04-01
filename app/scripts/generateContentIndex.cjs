// scripts/generateContentIndex.js
const fs = require("fs");
const path = require("path");

// Base directory to scan
const contentDir = path.join(__dirname, "..", "public", "content");
// Output file path
const outputFile = path.join(contentDir, "index.json");

/**
 * Converts snake_case to Title Case
 * Example: javascript_basics → JavaScript Basics
 */
function snakeToTitle(snakeCase) {
  return snakeCase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts description from markdown file content
 * Tries to use the first paragraph after the title as description
 */
function extractDescription(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Look for first paragraph after the heading
    const match = content.match(/# .+?\n\n(.+?)(\n\n|$)/);
    if (match && match[1]) {
      // Limit description length
      return match[1].trim().substring(0, 160);
    }
  } catch (error) {
    console.warn(`Could not extract description from: ${filePath}`);
  }

  // Fallback description
  return `Documentation for ${snakeToTitle(fileName)}`;
}

/**
 * Recursively scans a directory and builds the content structure
 */
function scanDirectory(dir, basePath = "") {
  const result = {
    categories: [],
    files: [],
  };

  // Skip if directory doesn't exist
  if (!fs.existsSync(dir)) {
    return result;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    // Skip index.json and hidden files
    if (item === "index.json" || item.startsWith(".")) continue;

    const itemPath = path.join(dir, item);
    const relativePath = path.join(basePath, item).replace(/\\/g, "/");
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // It's a directory/category
      const dirName = path.basename(item);

      // Determine appropriate icon based on directory name
      let icon = "Folder";
      if (dirName.toLowerCase().includes("python")) icon = "FileCode";
      else if (dirName.toLowerCase().includes("javascript")) icon = "Code";
      else if (dirName.toLowerCase().includes("react")) icon = "Boxes";
      else if (dirName.toLowerCase().includes("api")) icon = "ServerCrash";
      else if (dirName.toLowerCase().includes("data")) icon = "Database";

      const category = {
        id: dirName,
        name: snakeToTitle(dirName),
        icon: icon,
        subcategories: [],
        files: [],
      };

      // Scan the subdirectory
      const subResult = scanDirectory(itemPath, relativePath);

      if (subResult.categories.length > 0) {
        category.subcategories = subResult.categories;
      }

      if (subResult.files.length > 0) {
        category.files = subResult.files;
      }

      // Only add category if it has subcategories or files
      if (category.subcategories.length > 0 || category.files.length > 0) {
        result.categories.push(category);
      }
    } else if (stat.isFile() && item.endsWith(".md")) {
      // It's a markdown file
      const fileName = path.basename(item, ".md");
      if (fileName === "index") continue; // Skip index files

      const file = {
        path: relativePath,
        title: snakeToTitle(fileName),
        description: extractDescription(itemPath, fileName),
      };

      result.files.push(file);
    }
  }

  return result;
}

// Main execution
try {
  console.log("Generating content index...");

  // Check if content directory exists
  if (!fs.existsSync(contentDir)) {
    console.log(`Content directory not found: ${contentDir}`);
    console.log("Creating content directory...");
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // Process the content directory
  const result = scanDirectory(contentDir);

  const contentStructure = {
    categories: result.categories,
    files: result.files,
  };

  // Create parent directories if they don't exist
  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the output file
  fs.writeFileSync(outputFile, JSON.stringify(contentStructure, null, 2));

  console.log(`Successfully generated index.json at ${outputFile}`);
  console.log(
    `Found ${result.files.length} files and ${result.categories.length} categories`
  );
} catch (error) {
  console.error("Error generating index.json:", error);
  process.exit(1);
}
