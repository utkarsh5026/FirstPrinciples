const fs = require("fs");
const path = require("path");

const outputFileName = "index.json";
const contentDir = path.join(__dirname, "..", "public", "content");
const outputFile = path.join(contentDir, outputFileName);

const files_to_ignore = ["section-metadata.json", outputFileName];

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
 * Recursively scans a directory and builds the content structure
 *
 * @param {string} dir - The directory to scan
 * @param {string} basePath - The base path of the directory
 * @returns {Object} The content structure
 */
function scanDirectory(dir, basePath = "") {
  const result = {
    categories: [],
    files: [],
  };

  if (!fs.existsSync(dir)) {
    return result;
  }

  const direcoryItems = fs.readdirSync(dir);

  /**
   * Handles a directory item
   * @param {string} fileName - The directory item to handle
   * @param {string} itemPath - The path to the directory item
   * @param {string} relativePath - The relative path to the directory item
   */
  const handleDir = (fileName, itemPath, relativePath) => {
    const dirName = path.basename(fileName);
    const category = {
      id: dirName,
      name: snakeToTitle(dirName),
      categories: [],
      files: [],
    };

    const subResult = scanDirectory(itemPath, relativePath);

    if (subResult.categories.length > 0)
      category.categories = subResult.categories;

    if (subResult.files.length > 0) category.files = subResult.files;

    if (category.categories.length > 0 || category.files.length > 0)
      result.categories.push(category);
  };

  /**
   * Handles a markdown file
   * @param {string} filePath - The path to the markdown file
   * @param {string} relativePath - The relative path to the markdown file
   */
  const handleMarkdownFile = (filePath, relativePath) => {
    const fileName = path.basename(filePath, ".md");
    if (fileName === "index") return;

    const file = {
      path: relativePath,
    };

    result.files.push(file);
  };

  for (const item of direcoryItems) {
    if (files_to_ignore.includes(item) || item.startsWith(".")) continue;

    const itemPath = path.join(dir, item);
    const relativePath = path.join(basePath, item).replace(/\\/g, "/");
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) handleDir(item, itemPath, relativePath);
    else if (stat.isFile() && item.endsWith(".md"))
      handleMarkdownFile(itemPath, relativePath);
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
    `Found ${result.files.length} files in the root directory and ${result.categories.length} categories`
  );

  console.log("\nCategories and categories:");
  console.log("============================");

  for (const category of result.categories) {
    console.log(`• ${category.name} (${category.id})`);

    if (category.categories.length > 0) {
      for (const subCategory of category.categories) {
        console.log(`  └─ ${subCategory.name})`);

        const fileCount = subCategory.files ? subCategory.files.length : 0;
        console.log(`     ${fileCount} files\n`);
      }
    } else {
      console.log(`  No categories`);
    }
    console.log("");
  }
} catch (error) {
  console.error("Error generating index.json:", error);
  process.exit(1);
}
