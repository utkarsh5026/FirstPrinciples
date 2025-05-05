const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "..", "public", "content");
const outputFile = path.join(contentDir, "index.json");

const files_to_ignore = ["section-metadata.json", "index.json"];

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

  if (!fs.existsSync(dir)) {
    return result;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (files_to_ignore.includes(item) || item.startsWith(".")) continue;

    const itemPath = path.join(dir, item);
    const relativePath = path.join(basePath, item).replace(/\\/g, "/");
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const dirName = path.basename(item);
      const category = {
        id: dirName,
        name: snakeToTitle(dirName),
        subcategories: [],
        files: [],
      };

      const subResult = scanDirectory(itemPath, relativePath);

      if (subResult.categories.length > 0)
        category.subcategories = subResult.categories;

      if (subResult.files.length > 0) {
        category.files = subResult.files;
      }

      if (category.subcategories.length > 0 || category.files.length > 0) {
        result.categories.push(category);
      }
    } else if (stat.isFile() && item.endsWith(".md")) {
      const fileName = path.basename(item, ".md");
      if (fileName === "index") continue;

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

try {
  console.log("Generating content index...");

  if (!fs.existsSync(contentDir)) {
    console.log(`Content directory not found: ${contentDir}`);
    console.log("Creating content directory...");
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const result = scanDirectory(contentDir);

  const contentStructure = {
    categories: result.categories,
    files: result.files,
  };

  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(contentStructure, null, 2));

  console.log(`Successfully generated index.json at ${outputFile}`);
  console.log(
    `Found ${result.files.length} files and ${result.categories.length} categories`
  );
} catch (error) {
  console.error("Error generating index.json:", error);
  process.exit(1);
}
