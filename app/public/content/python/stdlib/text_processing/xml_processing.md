# XML Processing in Python: From First Principles

## Understanding the Foundation: What is XML and Why Process It?

Before diving into Python's tools, let's understand what we're working with from computational first principles.

XML (eXtensible Markup Language) is a hierarchical, text-based data format designed for structured information exchange. Think of it as a tree of labeled containers:

```
Document (Root)
├── Container A
│   ├── Data Item 1
│   └── Container B
│       └── Data Item 2
└── Container C
    └── Data Item 3
```

**Why can't we just use string methods to process XML?** While XML looks like text, it has semantic structure that requires understanding:

* Nested hierarchies
* Attributes vs text content
* Namespaces
* Character encoding rules
* Well-formedness requirements

> **Key Mental Model** : XML is not just text with angle brackets - it's a tree data structure serialized as text. Processing it requires converting between the tree representation and the text representation.

## Python's Approach: xml.etree.ElementTree

Python's standard library provides several XML processing options, but `xml.etree.ElementTree` strikes the best balance for most use cases:

```python
# The ElementTree module provides a simple, efficient API
import xml.etree.ElementTree as ET

# Why this import pattern? 
# - 'ET' is the conventional alias (widely recognized)
# - The module name is long, so aliasing improves readability
# - Follows Python's "explicit is better than implicit" principle
```

> **Python Design Philosophy** : ElementTree follows Python's principle of "batteries included" - providing a capable, easy-to-use XML processor in the standard library without requiring external dependencies.

## Fundamental Concept 1: The Element Object Model

ElementTree models XML as a tree of `Element` objects. Let's understand this from first principles:

```python
import xml.etree.ElementTree as ET

# Every XML element becomes an Element object with:
# - tag: the element name
# - attrib: dictionary of attributes  
# - text: text content between opening and closing tags
# - tail: text after the closing tag (rarely used)
# - children: list of child elements

# Let's see this in action with a simple example
xml_string = """
<book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
</book>
"""

# Parse the XML string into an Element object
root = ET.fromstring(xml_string)

# Examine the root element's properties
print(f"Tag: {root.tag}")           # Tag: book
print(f"Attributes: {root.attrib}") # Attributes: {'id': '1', 'category': 'fiction'}
print(f"Text: {repr(root.text)}")   # Text: '\n    ' (whitespace between tags)

# Access child elements
for child in root:
    print(f"Child tag: {child.tag}, text: {child.text}")
    # Child tag: title, text: The Great Gatsby
    # Child tag: author, text: F. Scott Fitzgerald  
    # Child tag: year, text: 1925
```

ASCII representation of the Element tree structure:

```
Element(tag='book', attrib={'id':'1', 'category':'fiction'})
├── Element(tag='title', text='The Great Gatsby')
├── Element(tag='author', text='F. Scott Fitzgerald')
└── Element(tag='year', text='1925')
```

## Fundamental Concept 2: Parsing XML - String vs File Sources

ElementTree provides multiple entry points depending on your data source:

```python
import xml.etree.ElementTree as ET

# Method 1: Parse from string (for data already in memory)
xml_string = "<root><item>data</item></root>"
root_from_string = ET.fromstring(xml_string)

# Method 2: Parse from file (most common for real applications)
# ET.parse() returns an ElementTree object, not just the root Element
tree = ET.parse('data.xml')
root_from_file = tree.getroot()

# Method 3: Parse from file-like object (streams, URLs, etc.)
import io
xml_stream = io.StringIO(xml_string)
tree_from_stream = ET.parse(xml_stream)
root_from_stream = tree_from_stream.getroot()

# Why different methods?
# - fromstring(): Fast, direct conversion for in-memory data
# - parse(): Provides access to document-level info (encoding, etc.)
# - File objects: Memory-efficient for large documents
```

> **Common Pitfall** : `ET.parse()` returns an `ElementTree` object, while `ET.fromstring()` returns the root `Element` directly. This difference causes many beginner errors.

## Progressive Example: Real-World XML Processing

Let's work with a practical example - processing a library catalog:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
    <book id="1" available="true">
        <title>Python Programming</title>
        <author>John Smith</author>
        <isbn>978-0123456789</isbn>
        <price currency="USD">29.99</price>
        <categories>
            <category>Programming</category>
            <category>Computer Science</category>
        </categories>
    </book>
    <book id="2" available="false">
        <title>Data Structures</title>
        <author>Jane Doe</author>
        <isbn>978-9876543210</isbn>
        <price currency="EUR">34.50</price>
        <categories>
            <category>Computer Science</category>
            <category>Algorithms</category>
        </categories>
    </book>
</library>
```

### Basic Parsing and Navigation

```python
import xml.etree.ElementTree as ET

# Parse the XML file
tree = ET.parse('library.xml')
root = tree.getroot()

print(f"Root element: {root.tag}")  # Root element: library

# Method 1: Iterate through direct children
print("Books in library:")
for book in root:  # root is iterable over its children
    book_id = book.attrib['id']
    available = book.attrib['available']
    print(f"Book ID: {book_id}, Available: {available}")

# Method 2: Find specific elements by tag name
titles = root.findall('book/title')  # XPath-like syntax
for title in titles:
    print(f"Title: {title.text}")

# Method 3: Find with conditions (more advanced)
available_books = root.findall("book[@available='true']")
print(f"Available books: {len(available_books)}")
```

### Understanding ElementTree's Search Methods

ElementTree provides several methods for finding elements. Understanding their differences is crucial:

```python
# find() - Returns FIRST matching element or None
first_book = root.find('book')
print(f"First book ID: {first_book.attrib['id']}")

# findall() - Returns LIST of all matching elements  
all_books = root.findall('book')
print(f"Total books: {len(all_books)}")

# findtext() - Returns text content of FIRST match or default
first_title = root.findtext('book/title', 'No title found')
print(f"First book title: {first_title}")

# iter() - Generator for ALL descendants matching tag
for category in root.iter('category'):
    print(f"Category: {category.text}")

# Key differences in mental model:
# - find*() methods: Search immediate children + their descendants
# - iter(): Search ALL descendants recursively
# - XPath support is limited but useful for basic filtering
```

> **Performance Consideration** : `iter()` is memory-efficient for large documents because it's a generator. `findall()` creates a list in memory.

## Advanced Parsing: Handling Complex Structures

```python
def extract_book_info(book_element):
    """
    Extract complete book information from an XML element.
    Demonstrates robust XML processing patterns.
    """
    # Safe attribute access with defaults
    book_info = {
        'id': book_element.attrib.get('id', 'unknown'),
        'available': book_element.attrib.get('available', 'false') == 'true'
    }
  
    # Safe text extraction with error handling
    title_elem = book_element.find('title')
    book_info['title'] = title_elem.text if title_elem is not None else 'Unknown'
  
    author_elem = book_element.find('author')
    book_info['author'] = author_elem.text if author_elem is not None else 'Unknown'
  
    # Handle nested structures - price with currency attribute
    price_elem = book_element.find('price')
    if price_elem is not None:
        book_info['price'] = {
            'amount': float(price_elem.text),
            'currency': price_elem.attrib.get('currency', 'USD')
        }
  
    # Handle collections - multiple categories
    categories = []
    for category in book_element.findall('categories/category'):
        categories.append(category.text)
    book_info['categories'] = categories
  
    return book_info

# Usage
tree = ET.parse('library.xml')
root = tree.getroot()

for book in root.findall('book'):
    info = extract_book_info(book)
    print(f"Book: {info['title']} by {info['author']}")
    print(f"Price: {info['price']['amount']} {info['price']['currency']}")
    print(f"Categories: {', '.join(info['categories'])}")
    print(f"Available: {info['available']}")
    print("-" * 40)
```

> **Best Practice** : Always use `.get()` for attributes and check for `None` when using `.find()`. XML data is often incomplete or inconsistent.

## Creating XML Documents: The Pythonic Way

Creating XML involves building Element objects and assembling them into a tree:

```python
import xml.etree.ElementTree as ET

# Method 1: Programmatic creation (most flexible)
def create_book_xml():
    # Create root element
    library = ET.Element('library')
  
    # Create a book element with attributes
    book = ET.SubElement(library, 'book', id='1', available='true')
  
    # Add simple text elements
    title = ET.SubElement(book, 'title')
    title.text = 'Learning Python'
  
    author = ET.SubElement(book, 'author')  
    author.text = 'Mark Lutz'
  
    # Add element with attributes
    price = ET.SubElement(book, 'price', currency='USD')
    price.text = '49.99'
  
    # Add nested structure
    categories = ET.SubElement(book, 'categories')
  
    cat1 = ET.SubElement(categories, 'category')
    cat1.text = 'Programming'
  
    cat2 = ET.SubElement(categories, 'category')
    cat2.text = 'Python'
  
    return library

# Create the XML structure
root = create_book_xml()

# Convert to string for output
xml_string = ET.tostring(root, encoding='unicode')
print(xml_string)
```

**Understanding Element Creation Patterns:**

```python
# Pattern 1: Create parent, then children separately
parent = ET.Element('parent')
child = ET.Element('child')
parent.append(child)  # Manually append

# Pattern 2: Create child as SubElement (more Pythonic)
parent = ET.Element('parent')
child = ET.SubElement(parent, 'child')  # Automatically appended

# Pattern 3: Batch creation with attributes
parent = ET.Element('parent')
child = ET.SubElement(parent, 'child', 
                     attr1='value1', 
                     attr2='value2')

# Why SubElement is preferred:
# - Automatically handles parent-child relationship
# - Less error-prone than manual append()
# - More readable and concise
```

## Writing XML to Files: Proper Formatting and Encoding

```python
import xml.etree.ElementTree as ET

def create_and_save_library():
    # Create a more complex library structure
    library = ET.Element('library')
  
    # Book 1
    book1 = ET.SubElement(library, 'book', id='1', available='true')
    ET.SubElement(book1, 'title').text = 'Python Cookbook'
    ET.SubElement(book1, 'author').text = 'David Beazley'
    ET.SubElement(book1, 'isbn').text = '978-1449340377'
  
    # Book 2  
    book2 = ET.SubElement(library, 'book', id='2', available='false')
    ET.SubElement(book2, 'title').text = 'Fluent Python'
    ET.SubElement(book2, 'author').text = 'Luciano Ramalho'
    ET.SubElement(book2, 'isbn').text = '978-1491946008'
  
    # Create ElementTree object for writing
    tree = ET.ElementTree(library)
  
    # Method 1: Write with automatic formatting (Python 3.9+)
    try:
        ET.indent(tree, space="  ", level=0)  # Pretty-print formatting
        tree.write('library_output.xml', 
                  encoding='utf-8', 
                  xml_declaration=True)
    except AttributeError:
        # Fallback for older Python versions
        tree.write('library_output.xml', 
                  encoding='utf-8',
                  xml_declaration=True)
  
    # Method 2: Manual string formatting for older Python
    xml_str = ET.tostring(library, encoding='unicode')
  
    # For human-readable output, you might need manual formatting
    # or use external libraries like lxml for better pretty-printing
  
    print("XML file created successfully!")

create_and_save_library()
```

## Modifying Existing XML Documents

Real-world applications often need to modify existing XML. Here's how to do it safely:## Handling XML Namespaces: A Critical Real-World Skill

XML namespaces are one of the most confusing aspects for beginners, but they're essential for processing real-world XML documents:

```python
import xml.etree.ElementTree as ET

# Example XML with namespaces (common in web services, RSS feeds, etc.)
xml_with_namespaces = """<?xml version="1.0" encoding="UTF-8"?>
<library xmlns="http://example.com/library" 
         xmlns:meta="http://example.com/metadata">
    <book meta:id="1">
        <title>Python Guide</title>
        <meta:created>2024-01-15</meta:created>
        <meta:tags>
            <meta:tag>programming</meta:tag>
            <meta:tag>python</meta:tag>
        </meta:tags>
    </book>
</library>"""

# Parse XML with namespaces
root = ET.fromstring(xml_with_namespaces)

# ❌ This won't work - namespace-unaware search
# books = root.findall('book')  # Returns empty list!

# ✅ Correct way - define namespace mappings
namespaces = {
    'lib': 'http://example.com/library',      # Default namespace gets a prefix
    'meta': 'http://example.com/metadata'      # Keep existing prefix
}

# Now search with namespace prefixes
books = root.findall('lib:book', namespaces)
print(f"Found {len(books)} books")

# Access namespaced elements and attributes
for book in books:
    # Attribute with namespace
    book_id = book.attrib.get('{http://example.com/metadata}id')
    print(f"Book ID: {book_id}")
  
    # Element with default namespace
    title = book.findtext('lib:title', namespaces=namespaces)
    print(f"Title: {title}")
  
    # Elements with explicit namespace
    tags = book.findall('meta:tags/meta:tag', namespaces)
    tag_texts = [tag.text for tag in tags]
    print(f"Tags: {', '.join(tag_texts)}")
```

> **Namespace Mental Model** : When XML uses namespaces, element names become `{namespace_uri}local_name`. ElementTree requires you to either use this full form or provide a namespace mapping for abbreviated searches.

**Creating XML with Namespaces:**

```python
# Creating namespaced XML requires careful attribute handling
def create_namespaced_xml():
    # Define namespace URIs
    lib_ns = "http://example.com/library"
    meta_ns = "http://example.com/metadata"
  
    # Root element with default namespace
    root = ET.Element(f"{{{lib_ns}}}library")
  
    # Set namespace declarations (for proper XML output)
    root.set('xmlns', lib_ns)
    root.set('xmlns:meta', meta_ns)
  
    # Create book with namespaced attribute
    book = ET.SubElement(root, f"{{{lib_ns}}}book")
    book.set(f"{{{meta_ns}}}id", "1")
  
    # Add elements in different namespaces
    title = ET.SubElement(book, f"{{{lib_ns}}}title")
    title.text = "Namespace Example"
  
    created = ET.SubElement(book, f"{{{meta_ns}}}created")
    created.text = "2024-01-15"
  
    return root

namespaced_xml = create_namespaced_xml()
print(ET.tostring(namespaced_xml, encoding='unicode'))
```

## Advanced XPath-like Features in ElementTree

While ElementTree doesn't support full XPath, it provides useful path expressions:

```python
import xml.etree.ElementTree as ET

xml_data = """
<store>
    <department name="books">
        <item id="1" price="29.99" category="fiction">
            <name>Novel A</name>
            <stock>5</stock>
        </item>
        <item id="2" price="19.99" category="non-fiction">
            <name>Guide B</name>
            <stock>0</stock>
        </item>
    </department>
    <department name="electronics">
        <item id="3" price="299.99" category="computer">
            <name>Laptop C</name>
            <stock>3</stock>
        </item>
    </department>
</store>
"""

root = ET.fromstring(xml_data)

# Path expressions supported by ElementTree:

# 1. Simple paths
books_dept = root.find("department[@name='books']")
print(f"Books department: {books_dept.attrib}")

# 2. Descendant search with //
all_items = root.findall(".//item")  # All items anywhere in document
print(f"Total items: {len(all_items)}")

# 3. Attribute-based filtering
fiction_items = root.findall(".//item[@category='fiction']")
for item in fiction_items:
    name = item.findtext('name')
    print(f"Fiction item: {name}")

# 4. Multiple conditions (limited support)
# Note: ElementTree has limited XPath support
books_with_stock = []
for item in root.findall(".//item"):
    dept = item.getparent() if hasattr(item, 'getparent') else None
    # Alternative way to check parent
    for dept in root.findall("department"):
        if item in dept:
            if (dept.attrib.get('name') == 'books' and 
                int(item.findtext('stock', '0')) > 0):
                books_with_stock.append(item)

print(f"Books in stock: {len(books_with_stock)}")

# 5. Text content searching (manual approach)
def find_items_by_name_contains(root, search_term):
    """Find items whose name contains search term"""
    matches = []
    for item in root.findall('.//item'):
        name = item.findtext('name', '')
        if search_term.lower() in name.lower():
            matches.append(item)
    return matches

novel_items = find_items_by_name_contains(root, 'novel')
for item in novel_items:
    print(f"Found: {item.findtext('name')}")
```

> **XPath Limitations** : ElementTree supports only a subset of XPath. For complex queries, consider using the `lxml` library which provides full XPath 1.0 support.

## Performance Considerations and Memory Management

Understanding ElementTree's performance characteristics helps you write efficient XML processing code:

```python
import xml.etree.ElementTree as ET
import time
import sys

def demonstrate_performance_patterns():
    """
    Shows memory and performance considerations for XML processing.
    """
  
    # Create a large XML document for testing
    def create_large_xml():
        root = ET.Element('catalog')
        for i in range(1000):  # 1000 products
            product = ET.SubElement(root, 'product', id=str(i))
            ET.SubElement(product, 'name').text = f'Product {i}'
            ET.SubElement(product, 'price').text = str(19.99 + i * 0.01)
            ET.SubElement(product, 'description').text = f'Description for product {i}' * 10
        return root
  
    print("Creating large XML document...")
    large_xml = create_large_xml()
    xml_string = ET.tostring(large_xml, encoding='unicode')
  
    print(f"XML document size: {len(xml_string):,} characters")
    print(f"Memory usage of string: {sys.getsizeof(xml_string):,} bytes")
  
    # Performance comparison: different parsing approaches
  
    # Method 1: Parse entire document into memory
    start_time = time.time()
    root = ET.fromstring(xml_string)
    parse_time = time.time() - start_time
    print(f"Parse time (fromstring): {parse_time:.4f} seconds")
  
    # Method 2: Iterative parsing for large documents
    start_time = time.time()
  
    # Simulate processing large XML without loading all into memory
    # (This is a simplified example - real streaming would use different approaches)
    products_processed = 0
    for product in root.iter('product'):
        # Process each product
        name = product.findtext('name')
        price = float(product.findtext('price', '0'))
        products_processed += 1
      
        # Simulate some processing
        if products_processed % 100 == 0:
            pass  # Could print progress here
  
    iter_time = time.time() - start_time
    print(f"Iterative processing time: {iter_time:.4f} seconds")
    print(f"Products processed: {products_processed}")

# Memory-efficient patterns for large XML files
def memory_efficient_xml_processing():
    """
    Demonstrates memory-efficient XML processing patterns.
    """
  
    print("\n=== MEMORY-EFFICIENT PATTERNS ===")
  
    # Pattern 1: Process elements as you go, don't accumulate
    def extract_prices_efficiently(root):
        """Extract all prices without storing all elements in memory"""
        prices = []
        for product in root.iter('product'):
            price_text = product.findtext('price')
            if price_text:
                prices.append(float(price_text))
            # Element goes out of scope and can be garbage collected
        return prices
  
    # Pattern 2: Use generators for lazy evaluation
    def product_generator(root):
        """Generator that yields product info without storing all in memory"""
        for product in root.iter('product'):
            yield {
                'id': product.attrib.get('id'),
                'name': product.findtext('name'),
                'price': float(product.findtext('price', '0'))
            }
  
    # Create test data
    root = ET.Element('catalog')
    for i in range(100):
        product = ET.SubElement(root, 'product', id=str(i))
        ET.SubElement(product, 'name').text = f'Product {i}'
        ET.SubElement(product, 'price').text = str(10.00 + i)
  
    # Use the efficient patterns
    prices = extract_prices_efficiently(root)
    print(f"Extracted {len(prices)} prices efficiently")
    print(f"Average price: ${sum(prices)/len(prices):.2f}")
  
    # Process with generator (memory-efficient for large datasets)
    expensive_products = [
        p for p in product_generator(root) 
        if p['price'] > 50.0
    ]
    print(f"Found {len(expensive_products)} expensive products")

if __name__ == "__main__":
    demonstrate_performance_patterns()
    memory_efficient_xml_processing()
```

## Error Handling and Validation Best Practices

Robust XML processing requires comprehensive error handling:

```python
import xml.etree.ElementTree as ET
from pathlib import Path

def robust_xml_processing():
    """
    Demonstrates comprehensive error handling for XML processing.
    """
  
    def safe_parse_xml(source):
        """
        Safely parse XML from various sources with comprehensive error handling.
      
        Args:
            source: Can be file path, string, or file-like object
          
        Returns:
            tuple: (success: bool, result: Element or error message)
        """
        try:
            # Determine source type and parse accordingly
            if isinstance(source, str):
                if source.strip().startswith('<'):
                    # It's an XML string
                    root = ET.fromstring(source)
                else:
                    # It's a file path
                    if not Path(source).exists():
                        return False, f"File not found: {source}"
                  
                    tree = ET.parse(source)
                    root = tree.getroot()
            else:
                # Assume it's a file-like object
                tree = ET.parse(source)
                root = tree.getroot()
          
            return True, root
          
        except ET.ParseError as e:
            error_msg = f"XML Parse Error: {e}"
            if hasattr(e, 'lineno'):
                error_msg += f" (Line {e.lineno})"
            return False, error_msg
          
        except FileNotFoundError as e:
            return False, f"File not found: {e}"
          
        except PermissionError as e:
            return False, f"Permission denied: {e}"
          
        except Exception as e:
            return False, f"Unexpected error: {e}"
  
    def safe_element_access(element, path, default=None, convert_func=None):
        """
        Safely access element content with optional type conversion.
      
        Args:
            element: The parent Element
            path: XPath-like string to find the target
            default: Default value if element not found
            convert_func: Function to convert text content (e.g., int, float)
          
        Returns:
            Converted value or default
        """
        try:
            found_element = element.find(path)
            if found_element is None:
                return default
          
            text_content = found_element.text
            if text_content is None:
                return default
          
            if convert_func:
                return convert_func(text_content.strip())
          
            return text_content.strip()
          
        except (ValueError, TypeError) as e:
            print(f"Conversion error for path '{path}': {e}")
            return default
  
    # Example usage with error handling
    test_cases = [
        # Valid XML
        """<catalog>
            <product id="1">
                <name>Test Product</name>
                <price>29.99</price>
                <stock>5</stock>
            </product>
        </catalog>""",
      
        # Invalid XML (missing closing tag)
        """<catalog>
            <product id="1">
                <name>Test Product</name>
                <price>29.99</price>
        </catalog>""",
      
        # Non-existent file
        "nonexistent_file.xml"
    ]
  
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        success, result = safe_parse_xml(test_case)
      
        if success:
            print("✅ XML parsed successfully")
          
            # Safely extract data from the parsed XML
            for product in result.findall('product'):
                product_id = product.attrib.get('id', 'unknown')
                name = safe_element_access(product, 'name', 'Unknown Product')
                price = safe_element_access(product, 'price', 0.0, float)
                stock = safe_element_access(product, 'stock', 0, int)
              
                print(f"Product {product_id}: {name}")
                print(f"  Price: ${price:.2f}")
                print(f"  Stock: {stock} units")
        else:
            print(f"❌ Error: {result}")

def xml_schema_validation_concept():
    """
    Explains XML validation concepts (ElementTree doesn't include schema validation).
    """
  
    print("\n=== XML VALIDATION CONCEPTS ===")
  
    print("""
ElementTree provides basic well-formedness checking but not schema validation.
For production applications, consider:

1. Well-formedness (ElementTree handles this):
   - Proper tag nesting
   - Matched opening/closing tags
   - Valid character encoding

2. Schema validation (requires external libraries):
   - DTD (Document Type Definition)
   - XML Schema (XSD)
   - RelaxNG
   
For schema validation, consider using 'lxml' library:
   from lxml import etree
   
   schema = etree.XMLSchema(etree.parse('schema.xsd'))
   parser = etree.XMLParser(schema=schema)
   valid_doc = etree.parse('document.xml', parser)
""")

if __name__ == "__main__":
    robust_xml_processing()
    xml_schema_validation_concept()
```

## Comparing ElementTree with Alternatives

Understanding when to use ElementTree vs other options:

> **ElementTree vs Alternatives** :
>
> **Use ElementTree when** :
>
> * Standard library dependency is important
> * Memory usage needs to be moderate
> * XML documents are well-formed and not extremely large
> * Basic XPath expressions are sufficient
>
> **Consider alternatives when** :
>
> * **lxml** : Need full XPath support, XSLT, or schema validation
> * **BeautifulSoup** : Parsing HTML or malformed XML
> * **xml.sax** : Memory-critical streaming of very large documents
> * **xml.dom.minidom** : Need DOM-style manipulation (rarely recommended)

## Real-World Application: RSS Feed Parser

Let's build a complete, production-ready RSS feed parser to demonstrate all concepts:

```python
"""
Production-ready RSS Feed Parser using xml.etree.ElementTree

This example demonstrates all major XML processing concepts in a real-world application:
- Namespace handling
- Error handling and validation
- Performance considerations
- Data extraction and transformation
- Creating structured output

Author: Assistant
Date: 2024
"""

import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.request import urlopen
from urllib.error import URLError, HTTPError
import re
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import json

@dataclass
class RSSItem:
    """Data class for RSS feed items"""
    title: str
    link: str
    description: str
    pub_date: Optional[datetime]
    author: Optional[str]
    categories: List[str]
    guid: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'title': self.title,
            'link': self.link,
            'description': self.description,
            'pub_date': self.pub_date.isoformat() if self.pub_date else None,
            'author': self.author,
            'categories': self.categories,
            'guid': self.guid
        }

@dataclass
class RSSFeed:
    """Data class for RSS feed metadata"""
    title: str
    link: str
    description: str
    language: Optional[str]
    pub_date: Optional[datetime]
    items: List[RSSItem]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'title': self.title,
            'link': self.link,
            'description': self.description,
            'language': self.language,
            'pub_date': self.pub_date.isoformat() if self.pub_date else None,
            'item_count': len(self.items),
            'items': [item.to_dict() for item in self.items]
        }

class RSSParser:
    """
    Production-ready RSS feed parser with comprehensive error handling
    and support for various RSS formats and namespaces.
    """
    
    # Common RSS namespaces
    NAMESPACES = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'atom': 'http://www.w3.org/2005/Atom',
        'media': 'http://search.yahoo.com/mrss/',
        'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
    }
    
    def __init__(self, timeout: int = 10):
        """Initialize parser with configurable timeout"""
        self.timeout = timeout
    
    def parse_feed_from_url(self, url: str) -> Optional[RSSFeed]:
        """
        Parse RSS feed from URL with comprehensive error handling.
        
        Args:
            url: RSS feed URL
            
        Returns:
            RSSFeed object or None if parsing failed
        """
        try:
            print(f"Fetching RSS feed from: {url}")
            
            # Fetch the RSS content
            with urlopen(url, timeout=self.timeout) as response:
                content = response.read()
                
            # Parse the XML content
            return self.parse_feed_from_string(content.decode('utf-8'))
            
        except HTTPError as e:
            print(f"HTTP Error {e.code}: {e.reason}")
            return None
        except URLError as e:
            print(f"URL Error: {e.reason}")
            return None
        except UnicodeDecodeError as e:
            print(f"Encoding error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error fetching feed: {e}")
            return None
    
    def parse_feed_from_string(self, xml_content: str) -> Optional[RSSFeed]:
        """
        Parse RSS feed from XML string.
        
        Args:
            xml_content: RSS XML content as string
            
        Returns:
            RSSFeed object or None if parsing failed
        """
        try:
            # Parse XML with proper error handling
            root = ET.fromstring(xml_content)
            
            # Detect RSS format (RSS 2.0, RSS 1.0, or Atom)
            if root.tag == 'rss':
                return self._parse_rss_2_0(root)
            elif root.tag.endswith('RDF'):  # RSS 1.0
                return self._parse_rss_1_0(root)
            elif root.tag.endswith('feed'):  # Atom
                return self._parse_atom_feed(root)
            else:
                print(f"Unsupported feed format: {root.tag}")
                return None
                
        except ET.ParseError as e:
            print(f"XML Parse Error: {e}")
            if hasattr(e, 'lineno'):
                print(f"Error at line {e.lineno}")
            return None
        except Exception as e:
            print(f"Unexpected error parsing feed: {e}")
            return None
    
    def _parse_rss_2_0(self, root: ET.Element) -> Optional[RSSFeed]:
        """Parse RSS 2.0 format feed"""
        try:
            # RSS 2.0 structure: <rss><channel>...</channel></rss>
            channel = root.find('channel')
            if channel is None:
                print("No channel element found in RSS feed")
                return None
            
            # Extract channel metadata
            feed = RSSFeed(
                title=self._safe_text(channel, 'title', 'Untitled Feed'),
                link=self._safe_text(channel, 'link', ''),
                description=self._safe_text(channel, 'description', ''),
                language=self._safe_text(channel, 'language'),
                pub_date=self._parse_date(self._safe_text(channel, 'pubDate')),
                items=[]
            )
            
            # Parse items
            for item_elem in channel.findall('item'):
                item = self._parse_rss_item(item_elem)
                if item:
                    feed.items.append(item)
            
            print(f"Successfully parsed RSS 2.0 feed: {len(feed.items)} items")
            return feed
            
        except Exception as e:
            print(f"Error parsing RSS 2.0 feed: {e}")
            return None
    
    def _parse_rss_1_0(self, root: ET.Element) -> Optional[RSSFeed]:
        """Parse RSS 1.0 (RDF) format feed"""
        # RSS 1.0 is more complex due to RDF structure
        # This is a simplified implementation
        try:
            # Find channel information
            channel = root.find('.//{http://purl.org/rss/1.0/}channel')
            if channel is None:
                print("No channel element found in RSS 1.0 feed")
                return None
            
            feed = RSSFeed(
                title=self._safe_text(channel, '{http://purl.org/rss/1.0/}title', 'Untitled Feed'),
                link=self._safe_text(channel, '{http://purl.org/rss/1.0/}link', ''),
                description=self._safe_text(channel, '{http://purl.org/rss/1.0/}description', ''),
                language=None,  # RSS 1.0 doesn't typically have language in channel
                pub_date=None,
                items=[]
            )
            
            # Parse items (they're typically siblings of channel in RSS 1.0)
            for item_elem in root.findall('.//{http://purl.org/rss/1.0/}item'):
                item = self._parse_rss_1_0_item(item_elem)
                if item:
                    feed.items.append(item)
            
            print(f"Successfully parsed RSS 1.0 feed: {len(feed.items)} items")
            return feed
            
        except Exception as e:
            print(f"Error parsing RSS 1.0 feed: {e}")
            return None
    
    def _parse_atom_feed(self, root: ET.Element) -> Optional[RSSFeed]:
        """Parse Atom format feed"""
        try:
            # Atom feeds have a different structure
            feed = RSSFeed(
                title=self._safe_text(root, '{http://www.w3.org/2005/Atom}title', 'Untitled Feed'),
                link=self._get_atom_link(root),
                description=self._safe_text(root, '{http://www.w3.org/2005/Atom}subtitle', ''),
                language=root.attrib.get('{http://www.w3.org/XML/1998/namespace}lang'),
                pub_date=self._parse_date(self._safe_text(root, '{http://www.w3.org/2005/Atom}updated')),
                items=[]
            )
            
            # Parse entries (Atom's equivalent of items)
            for entry_elem in root.findall('{http://www.w3.org/2005/Atom}entry'):
                item = self._parse_atom_entry(entry_elem)
                if item:
                    feed.items.append(item)
            
            print(f"Successfully parsed Atom feed: {len(feed.items)} items")
            return feed
            
        except Exception as e:
            print(f"Error parsing Atom feed: {e}")
            return None
    
    def _parse_rss_item(self, item_elem: ET.Element) -> Optional[RSSItem]:
        """Parse RSS 2.0 item element"""
        try:
            # Extract categories
            categories = [
                cat.text for cat in item_elem.findall('category') 
                if cat.text
            ]
            
            # Handle Dublin Core namespace for author if regular author not present
            author = (self._safe_text(item_elem, 'author') or 
                     self._safe_text(item_elem, 'dc:creator', namespaces=self.NAMESPACES))
            
            return RSSItem(
                title=self._safe_text(item_elem, 'title', 'Untitled'),
                link=self._safe_text(item_elem, 'link', ''),
                description=self._clean_html(self._safe_text(item_elem, 'description', '')),
                pub_date=self._parse_date(self._safe_text(item_elem, 'pubDate')),
                author=author,
                categories=categories,
                guid=self._safe_text(item_elem, 'guid')
            )
            
        except Exception as e:
            print(f"Error parsing RSS item: {e}")
            return None
    
    def _parse_rss_1_0_item(self, item_elem: ET.Element) -> Optional[RSSItem]:
        """Parse RSS 1.0 item element"""
        try:
            return RSSItem(
                title=self._safe_text(item_elem, '{http://purl.org/rss/1.0/}title', 'Untitled'),
                link=self._safe_text(item_elem, '{http://purl.org/rss/1.0/}link', ''),
                description=self._clean_html(self._safe_text(item_elem, '{http://purl.org/rss/1.0/}description', '')),
                pub_date=self._parse_date(self._safe_text(item_elem, 'dc:date', namespaces=self.NAMESPACES)),
                author=self._safe_text(item_elem, 'dc:creator', namespaces=self.NAMESPACES),
                categories=[],  # RSS 1.0 doesn't typically have categories in items
                guid=item_elem.attrib.get('{http://purl.org/rss/1.0/}about')
            )
            
        except Exception as e:
            print(f"Error parsing RSS 1.0 item: {e}")
            return None
    
    def _parse_atom_entry(self, entry_elem: ET.Element) -> Optional[RSSItem]:
        """Parse Atom entry element"""
        try:
            # Atom categories
            categories = [
                cat.attrib.get('term', '') 
                for cat in entry_elem.findall('{http://www.w3.org/2005/Atom}category')
            ]
            
            # Atom author
            author_elem = entry_elem.find('{http://www.w3.org/2005/Atom}author')
            author = None
            if author_elem is not None:
                author = self._safe_text(author_elem, '{http://www.w3.org/2005/Atom}name')
            
            return RSSItem(
                title=self._safe_text(entry_elem, '{http://www.w3.org/2005/Atom}title', 'Untitled'),
                link=self._get_atom_link(entry_elem),
                description=self._clean_html(self._safe_text(entry_elem, '{http://www.w3.org/2005/Atom}summary', '')),
                pub_date=self._parse_date(self._safe_text(entry_elem, '{http://www.w3.org/2005/Atom}published')),
                author=author,
                categories=categories,
                guid=self._safe_text(entry_elem, '{http://www.w3.org/2005/Atom}id')
            )
            
        except Exception as e:
            print(f"Error parsing Atom entry: {e}")
            return None
    
    def _safe_text(self, parent: ET.Element, path: str, default: str = None, 
                   namespaces: Dict[str, str] = None) -> Optional[str]:
        """Safely extract text content from XML element"""
        try:
            elem = parent.find(path, namespaces or {})
            if elem is not None and elem.text:
                return elem.text.strip()
            return default
        except Exception:
            return default
    
    def _get_atom_link(self, element: ET.Element) -> str:
        """Extract link from Atom element (can be complex)"""
        try:
            # Atom links can have different rel attributes
            link_elem = element.find('{http://www.w3.org/2005/Atom}link[@rel="alternate"]')
            if link_elem is None:
                link_elem = element.find('{http://www.w3.org/2005/Atom}link')
            
            if link_elem is not None:
                return link_elem.attrib.get('href', '')
            
            return ''
        except Exception:
            return ''
    
    def _parse_date(self, date_string: Optional[str]) -> Optional[datetime]:
        """Parse various date formats found in RSS feeds"""
        if not date_string:
            return None
        
        # Common RSS date formats
        date_formats = [
            '%a, %d %b %Y %H:%M:%S %z',      # RFC 2822 (RSS 2.0)
            '%a, %d %b %Y %H:%M:%S GMT',     # RFC 2822 without timezone
            '%Y-%m-%dT%H:%M:%SZ',            # ISO 8601 (Atom)
            '%Y-%m-%dT%H:%M:%S%z',           # ISO 8601 with timezone
            '%Y-%m-%d',                      # Simple date
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_string.strip(), fmt)
            except ValueError:
                continue
        
        print(f"Could not parse date: {date_string}")
        return None
    
    def _clean_html(self, text: str) -> str:
        """Remove HTML tags from text (basic cleaning)"""
        if not text:
            return ''
        
        # Simple HTML tag removal (for production, consider using html.parser or BeautifulSoup)
        html_pattern = re.compile(r'<[^>]+>')
        cleaned = html_pattern.sub('', text)
        
        # Clean up extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        return cleaned

# Example usage and demonstration
def demonstrate_rss_parser():
    """Demonstrate the RSS parser with various feed types"""
    
    parser = RSSParser(timeout=15)
    
    # Example RSS feeds (you can replace with real URLs)
    test_feeds = [
        # These are example URLs - replace with real RSS feeds
        "https://feeds.feedburner.com/oreilly/radar/radar",  # O'Reilly Radar
        "https://rss.cnn.com/rss/edition.rss",               # CNN
        "https://planet.python.org/rss20.xml",               # Planet Python
    ]
    
    print("RSS Feed Parser Demonstration")
    print("=" * 50)
    
    for i, feed_url in enumerate(test_feeds, 1):
        print(f"\n--- Feed {i}: {feed_url} ---")
        
        try:
            # Parse the feed
            feed = parser.parse_feed_from_url(feed_url)
            
            if feed:
                print(f"✅ Successfully parsed: {feed.title}")
                print(f"   Description: {feed.description[:100]}...")
                print(f"   Items: {len(feed.items)}")
                print(f"   Language: {feed.language or 'Not specified'}")
                
                # Show first few items
                for j, item in enumerate(feed.items[:3], 1):
                    print(f"\n   Item {j}: {item.title}")
                    print(f"   Link: {item.link}")
                    print(f"   Author: {item.author or 'Unknown'}")
                    print(f"   Categories: {', '.join(item.categories) or 'None'}")
                    if item.pub_date:
                        print(f"   Published: {item.pub_date.strftime('%Y-%m-%d %H:%M')}")
                
                # Save to JSON for further processing
                output_file = f"feed_{i}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(feed.to_dict(), f, indent=2, ensure_ascii=False)
                print(f"\n   💾 Saved to {output_file}")
                
            else:
                print("❌ Failed to parse feed")
                
        except Exception as e:
            print(f"❌ Error processing feed: {e}")

# Sample RSS content for testing without internet
SAMPLE_RSS = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Sample Tech Blog</title>
        <link>https://example.com</link>
        <description>A sample technology blog RSS feed</description>
        <language>en-us</language>
        <pubDate>Mon, 06 Jan 2024 10:00:00 GMT</pubDate>
        
        <item>
            <title>Introduction to Python XML Processing</title>
            <link>https://example.com/xml-processing</link>
            <description>Learn how to process XML documents in Python using ElementTree</description>
            <pubDate>Mon, 06 Jan 2024 09:00:00 GMT</pubDate>
            <author>tech@example.com</author>
            <category>Programming</category>
            <category>Python</category>
            <guid>https://example.com/xml-processing</guid>
        </item>
        
        <item>
            <title>Advanced XML Techniques</title>
            <link>https://example.com/advanced-xml</link>
            <description>Explore namespaces, XPath, and performance optimization in XML processing</description>
            <pubDate>Fri, 03 Jan 2024 14:30:00 GMT</pubDate>
            <author>advanced@example.com</author>
            <category>Programming</category>
            <category>XML</category>
            <guid>https://example.com/advanced-xml</guid>
        </item>
    </channel>
</rss>"""

def test_with_sample_data():
    """Test the parser with sample RSS data"""
    print("\n" + "=" * 60)
    print("TESTING WITH SAMPLE RSS DATA")
    print("=" * 60)
    
    parser = RSSParser()
    feed = parser.parse_feed_from_string(SAMPLE_RSS)
    
    if feed:
        print(f"✅ Sample feed parsed successfully!")
        print(f"Title: {feed.title}")
        print(f"Description: {feed.description}")
        print(f"Items: {len(feed.items)}")
        
        for i, item in enumerate(feed.items, 1):
            print(f"\nItem {i}:")
            print(f"  Title: {item.title}")
            print(f"  Author: {item.author}")
            print(f"  Categories: {', '.join(item.categories)}")
            print(f"  Published: {item.pub_date}")
    else:
        print("❌ Failed to parse sample feed")

if __name__ == "__main__":
    # Test with sample data first
    test_with_sample_data()
    
    # Uncomment to test with real feeds (requires internet)
    # demonstrate_rss_parser()
```


## Key Takeaways and Best Practices

> **The Pythonic Way for XML Processing** :
>
> 1. **Always use context managers** when possible, especially for file operations
> 2. **Handle namespaces explicitly** - most real-world XML uses them
> 3. **Validate assumptions** - check for None before accessing element properties
> 4. **Use appropriate search methods** - `find()` for single elements, `findall()` for lists, `iter()` for memory efficiency
> 5. **Plan for malformed data** - real-world XML is often imperfect

## Memory Model: How ElementTree Works Internally

Understanding ElementTree's internal memory model helps you write more efficient code:

```
XML Document in Memory (ElementTree Internal Structure)
┌─────────────────────────────────────┐
│            ElementTree              │
│  ┌─────────────────────────────────┐│
│  │           Root Element          ││
│  │  tag: "library"                 ││
│  │  attrib: {}                     ││
│  │  text: "\n  "                   ││
│  │  ┌─────────────────────────────┐││
│  │  │        Child Element        │││
│  │  │  tag: "book"                │││
│  │  │  attrib: {"id": "1"}        │││
│  │  │  text: "\n    "             │││
│  │  │  ┌─────────────────────────┐│││
│  │  │  │    Grandchild Element   ││││
│  │  │  │  tag: "title"           ││││
│  │  │  │  text: "Book Title"     ││││
│  │  │  └─────────────────────────┘│││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

Python Object References:
- Each Element is a Python object
- Children stored as list in parent
- Text content stored as strings
- Attributes stored as dictionaries
```

## Common Pitfalls and How to Avoid Them

**1. Namespace Confusion**

```python
# ❌ Wrong - ignores namespaces
items = root.findall('item')

# ✅ Correct - handles namespaces
namespaces = {'ns': 'http://example.com/namespace'}
items = root.findall('ns:item', namespaces)
```

**2. Modifying During Iteration**

```python
# ❌ Wrong - modifying list while iterating
for item in parent.findall('item'):
    if condition:
        parent.remove(item)  # Dangerous!

# ✅ Correct - collect first, then modify
items_to_remove = [item for item in parent.findall('item') if condition]
for item in items_to_remove:
    parent.remove(item)
```

**3. Assuming Elements Exist**

```python
# ❌ Wrong - can raise AttributeError
title = root.find('book').find('title').text

# ✅ Correct - safe navigation
book = root.find('book')
if book is not None:
    title_elem = book.find('title')
    title = title_elem.text if title_elem is not None else 'No title'
```

## Performance Guidelines

> **Memory and Speed Optimization** :
>
> * **Use `iter()` for large documents** - it's a generator and memory-efficient
> * **Process elements immediately** rather than storing them all in lists
> * **Clear references** to processed elements to help garbage collection
> * **Consider `xml.sax`** for extremely large documents that don't fit in memory
> * **Use `findtext()` with defaults** instead of chaining `find().text`

ElementTree strikes an excellent balance between ease of use and performance for most XML processing tasks. It's the go-to choice for XML work in Python unless you need advanced features like full XPath support or schema validation, in which case you'd move to specialized libraries like `lxml`.

The key to mastering XML processing in Python is understanding that you're working with tree data structures serialized as text, and ElementTree provides an intuitive, Pythonic interface for navigating and manipulating these trees while handling the complexities of XML parsing, namespaces, and encoding for you.
