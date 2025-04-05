# The Template Method Design Pattern: First Principles Explanation

The Template Method is a behavioral design pattern that defines the skeleton of an algorithm in a base class but lets subclasses override specific steps of the algorithm without changing its structure. Let me explain this pattern from first principles with a focus on Python implementation.

## The Problem Template Method Pattern Solves

Imagine you have several algorithms that follow similar steps but with slight variations in their implementation. Without a proper pattern, you might:

1. **Duplicate code** : Copy-paste similar algorithm structures across multiple classes
2. **Break encapsulation** : Expose too many details of an algorithm to subclasses
3. **Lose control over the algorithm flow** : Allow subclasses to modify critical parts of the algorithm
4. **Make maintenance difficult** : Changes to the algorithm structure require updates in multiple places

Consider this scenario with document processing algorithms:

```python
class PDFDocument:
    def process(self):
        # Open the document
        self._open_document()
      
        # Extract text
        text = self._extract_text()
      
        # Process content
        processed_text = self._process_content(text)
      
        # Generate output
        self._generate_output(processed_text)
      
        # Close the document
        self._close_document()
  
    def _open_document(self):
        print("Opening PDF document...")
      
    def _extract_text(self):
        print("Extracting text from PDF...")
        return "PDF text content"
      
    def _process_content(self, text):
        print("Processing PDF content...")
        return text.upper()
      
    def _generate_output(self, processed_text):
        print(f"Generating PDF output with: {processed_text}")
      
    def _close_document(self):
        print("Closing PDF document...")


class WordDocument:
    def process(self):
        # Open the document
        self._open_document()
      
        # Extract text
        text = self._extract_text()
      
        # Process content
        processed_text = self._process_content(text)
      
        # Generate output
        self._generate_output(processed_text)
      
        # Close the document
        self._close_document()
  
    def _open_document(self):
        print("Opening Word document...")
      
    def _extract_text(self):
        print("Extracting text from Word document...")
        return "Word text content"
      
    def _process_content(self, text):
        print("Processing Word content...")
        return text.upper()
      
    def _generate_output(self, processed_text):
        print(f"Generating Word output with: {processed_text}")
      
    def _close_document(self):
        print("Closing Word document...")
```

Notice how the `process()` method in both classes is identical, but the specific steps vary. This is a perfect case for the Template Method pattern.

## The Template Method Pattern Solution

The Template Method pattern addresses these issues by:

1. Creating an abstract base class that defines the skeleton of an algorithm
2. Breaking the algorithm into a series of methods
3. Defining some methods as "hooks" that subclasses can override
4. Keeping the main algorithm structure (the "template method") final/non-overridable
5. Implementing common steps in the base class and requiring subclasses to implement specific steps

## Components of the Template Method Pattern

1. **Abstract Class** : Defines the template method and declares abstract operations
2. **Concrete Classes** : Implement the specific steps needed by the template method
3. **Template Method** : The algorithm skeleton that calls both concrete and abstract operations
4. **Primitive Operations** : Abstract methods that must be implemented by subclasses
5. **Hook Methods** : Optional methods with default implementations that subclasses may override

## Python Implementation

Let's implement the Document processing example using the Template Method pattern:

```python
from abc import ABC, abstractmethod

class Document(ABC):
    """Abstract base class defining the document processing template"""
  
    def process(self):
        """
        The template method defining the skeleton of the document processing algorithm.
        This method should remain unchanged by subclasses.
        """
        self._open_document()
      
        text = self._extract_text()
      
        # Optional hook - subclasses may override
        if self._should_process_content():
            processed_text = self._process_content(text)
        else:
            processed_text = text
      
        self._generate_output(processed_text)
      
        # Optional hook with default implementation
        self._apply_post_processing(processed_text)
      
        self._close_document()
  
    @abstractmethod
    def _open_document(self):
        """Required operation: Open the document"""
        pass
  
    @abstractmethod
    def _extract_text(self):
        """Required operation: Extract text from the document"""
        pass
  
    @abstractmethod
    def _generate_output(self, processed_text):
        """Required operation: Generate output based on processed text"""
        pass
  
    @abstractmethod
    def _close_document(self):
        """Required operation: Close the document"""
        pass
  
    def _process_content(self, text):
        """
        Hook method with default implementation.
        Subclasses may override this to provide custom processing.
        """
        return text.upper()
  
    def _should_process_content(self):
        """
        Hook method with default implementation.
        Subclasses may override to decide whether to process content.
        """
        return True
  
    def _apply_post_processing(self, processed_text):
        """
        Hook method with default implementation.
        Subclasses may override to add post-processing steps.
        """
        pass  # By default, do nothing
```

Now let's implement concrete subclasses:

```python
class PDFDocument(Document):
    """Concrete implementation for PDF documents"""
  
    def _open_document(self):
        print("Opening PDF document...")
  
    def _extract_text(self):
        print("Extracting text from PDF...")
        return "PDF text content"
  
    def _generate_output(self, processed_text):
        print(f"Generating PDF output with: {processed_text}")
  
    def _close_document(self):
        print("Closing PDF document...")
  
    # Override a hook method
    def _apply_post_processing(self, processed_text):
        print("Applying PDF-specific post-processing...")


class WordDocument(Document):
    """Concrete implementation for Word documents"""
  
    def _open_document(self):
        print("Opening Word document...")
  
    def _extract_text(self):
        print("Extracting text from Word document...")
        return "Word text content"
  
    def _generate_output(self, processed_text):
        print(f"Generating Word output with: {processed_text}")
  
    def _close_document(self):
        print("Closing Word document...")
  
    # Override a hook method with custom implementation
    def _process_content(self, text):
        print("Processing Word content with special formatting...")
        return text.upper() + " (formatted)"


class HTMLDocument(Document):
    """Concrete implementation for HTML documents"""
  
    def _open_document(self):
        print("Opening HTML document...")
  
    def _extract_text(self):
        print("Extracting text from HTML...")
        return "HTML text content"
  
    def _generate_output(self, processed_text):
        print(f"Generating HTML output with: {processed_text}")
  
    def _close_document(self):
        print("Closing HTML document...")
  
    # Override the hook to skip content processing
    def _should_process_content(self):
        print("Skipping content processing for HTML...")
        return False
```

Let's use these classes:

```python
# Client code uses the template method
def process_documents(documents):
    for document in documents:
        print(f"\nProcessing {document.__class__.__name__}:")
        document.process()

# Create document instances
documents = [
    PDFDocument(),
    WordDocument(),
    HTMLDocument()
]

# Process all documents
process_documents(documents)
```

The output would show:

```
Processing PDFDocument:
Opening PDF document...
Extracting text from PDF...
Generating PDF output with: PDF TEXT CONTENT
Applying PDF-specific post-processing...
Closing PDF document...

Processing WordDocument:
Opening Word document...
Extracting text from Word document...
Processing Word content with special formatting...
Generating Word output with: WORD TEXT CONTENT (formatted)
Closing Word document...

Processing HTMLDocument:
Opening HTML document...
Extracting text from HTML...
Skipping content processing for HTML...
Generating HTML output with: HTML text content
Closing HTML document...
```

Notice how:

1. The overall algorithm flow remains consistent (defined by the template method)
2. Each subclass provides specific implementations for required steps
3. Some subclasses override hook methods to customize behavior
4. The client code only interacts with the template method, not the individual steps

## Abstract Methods vs. Hook Methods

A key aspect of the Template Method pattern is the distinction between:

1. **Abstract Methods** : Must be implemented by subclasses (enforced by using `@abstractmethod`)
2. **Hook Methods** : Optional methods with default implementations that subclasses may override

This distinction guides subclass developers about what they must implement and what they may customize.

## The "Hollywood Principle"

The Template Method pattern follows the "Hollywood Principle": "Don't call us, we'll call you." The base class calls the methods of a subclass and not the other way around. This inversion of control:

1. Maintains the algorithm structure
2. Prevents subclasses from modifying the algorithm flow
3. Enforces consistent behavior across all implementations

## Real-World Example: Data Processing Framework

Let's implement a more practical example of a data processing framework:

```python
from abc import ABC, abstractmethod
import time
import logging

class DataProcessor(ABC):
    """Abstract base class for a data processing pipeline"""
  
    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger(self.__class__.__name__)
        self.stats = {
            "records_processed": 0,
            "errors": 0,
            "processing_time": 0
        }
  
    def process_data(self, data_source):
        """
        Template method defining the data processing pipeline.
      
        Args:
            data_source: The source of the data to process
        """
        self.logger.info(f"Starting data processing on {data_source}")
      
        try:
            # Initialize resources
            self._initialize()
          
            # Validate input
            if not self._validate_input(data_source):
                self.logger.error(f"Invalid input source: {data_source}")
                return False
          
            # Load data
            start_time = time.time()
            raw_data = self._load_data(data_source)
          
            # Pre-process data (hook)
            if self._should_preprocess():
                processed_data = self._preprocess_data(raw_data)
            else:
                processed_data = raw_data
          
            # Transform data
            transformed_data = self._transform_data(processed_data)
          
            # Apply business rules (hook)
            final_data = self._apply_business_rules(transformed_data)
          
            # Save results
            records_saved = self._save_results(final_data)
            self.stats["records_processed"] = records_saved
          
            end_time = time.time()
            self.stats["processing_time"] = end_time - start_time
          
            # Generate report (hook)
            self._generate_report()
          
            success = True
        except Exception as e:
            self.logger.exception(f"Error during processing: {str(e)}")
            self.stats["errors"] += 1
            success = False
        finally:
            # Clean up resources
            self._cleanup()
          
        return success
  
    def _initialize(self):
        """Initialize resources needed for processing"""
        self.logger.debug("Initializing resources")
  
    @abstractmethod
    def _validate_input(self, data_source):
        """
        Validate the input data source.
      
        Args:
            data_source: The source of the data
          
        Returns:
            bool: True if valid, False otherwise
        """
        pass
  
    @abstractmethod
    def _load_data(self, data_source):
        """
        Load data from the source.
      
        Args:
            data_source: The source of the data
          
        Returns:
            The loaded data
        """
        pass
  
    def _should_preprocess(self):
        """
        Hook method to determine if preprocessing is needed.
      
        Returns:
            bool: True if preprocessing should be applied
        """
        return True
  
    def _preprocess_data(self, data):
        """
        Hook method for preprocessing data.
      
        Args:
            data: The raw data
          
        Returns:
            The preprocessed data
        """
        self.logger.debug("Preprocessing data")
        return data
  
    @abstractmethod
    def _transform_data(self, data):
        """
        Transform the preprocessed data.
      
        Args:
            data: The preprocessed data
          
        Returns:
            The transformed data
        """
        pass
  
    def _apply_business_rules(self, data):
        """
        Hook method to apply business rules to the transformed data.
      
        Args:
            data: The transformed data
          
        Returns:
            The data after applying business rules
        """
        self.logger.debug("Applying business rules")
        return data
  
    @abstractmethod
    def _save_results(self, data):
        """
        Save the processed results.
      
        Args:
            data: The final processed data
          
        Returns:
            int: Number of records saved
        """
        pass
  
    def _generate_report(self):
        """
        Hook method to generate a processing report.
        """
        self.logger.info(f"Processing completed. Stats: {self.stats}")
  
    def _cleanup(self):
        """
        Clean up any resources used during processing.
        """
        self.logger.debug("Cleaning up resources")
```

Now let's implement a concrete CSV data processor:

```python
import csv
import os
from datetime import datetime

class CSVDataProcessor(DataProcessor):
    """Processor for CSV data files"""
  
    def __init__(self, output_dir="./output"):
        super().__init__()
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
      
        # Ensure output directory exists
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
  
    def _validate_input(self, data_source):
        """Check if the CSV file exists and has a valid format"""
        if not os.path.exists(data_source):
            return False
      
        if not data_source.endswith('.csv'):
            return False
          
        # Additional validation could check headers, file size, etc.
        return True
  
    def _load_data(self, data_source):
        """Load data from CSV file"""
        self.logger.info(f"Loading data from {data_source}")
      
        rows = []
        with open(data_source, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                rows.append(row)
              
        self.logger.info(f"Loaded {len(rows)} records from CSV")
        return rows
  
    def _preprocess_data(self, data):
        """Clean and prepare CSV data"""
        self.logger.info("Preprocessing CSV data")
      
        # Remove rows with missing values
        cleaned_data = [row for row in data if all(row.values())]
      
        # Convert numeric strings to actual numbers
        for row in cleaned_data:
            for key, value in row.items():
                # Try to convert to numeric if possible
                try:
                    if '.' in value:
                        row[key] = float(value)
                    else:
                        row[key] = int(value)
                except (ValueError, TypeError):
                    # Keep as string if conversion fails
                    pass
      
        self.logger.info(f"After preprocessing: {len(cleaned_data)} records")
        return cleaned_data
  
    def _transform_data(self, data):
        """Transform the data by calculating derived fields"""
        self.logger.info("Transforming data")
      
        # Example: If we have 'quantity' and 'price' fields, calculate 'total'
        for row in data:
            if 'quantity' in row and 'price' in row:
                row['total'] = row['quantity'] * row['price']
      
        return data
  
    def _apply_business_rules(self, data):
        """Apply business rules to filter and enhance the data"""
        self.logger.info("Applying business rules to CSV data")
      
        # Example: Filter out records with total < 100
        if data and 'total' in data[0]:
            filtered_data = [row for row in data if row.get('total', 0) >= 100]
            self.logger.info(f"Filtered out {len(data) - len(filtered_data)} records")
            return filtered_data
      
        return data
  
    def _save_results(self, data):
        """Save processed data to a new CSV file"""
        if not data:
            self.logger.warning("No data to save")
            return 0
          
        output_file = os.path.join(
            self.output_dir, 
            f"processed_{self.timestamp}.csv"
        )
      
        self.logger.info(f"Saving {len(data)} records to {output_file}")
      
        with open(output_file, 'w', newline='') as csvfile:
            if data:
                writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
      
        return len(data)
  
    def _generate_report(self):
        """Generate a detailed report of the processing"""
        super()._generate_report()
      
        report_file = os.path.join(
            self.output_dir, 
            f"report_{self.timestamp}.txt"
        )
      
        with open(report_file, 'w') as f:
            f.write(f"CSV Processing Report\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Records processed: {self.stats['records_processed']}\n")
            f.write(f"Errors encountered: {self.stats['errors']}\n")
            f.write(f"Processing time: {self.stats['processing_time']:.2f} seconds\n")
      
        self.logger.info(f"Report saved to {report_file}")
```

And another concrete implementation for JSON data:

```python
import json

class JSONDataProcessor(DataProcessor):
    """Processor for JSON data"""
  
    def _validate_input(self, data_source):
        """Check if the JSON file exists and is valid"""
        if not os.path.exists(data_source):
            return False
          
        if not data_source.endswith(('.json', '.jsonl')):
            return False
          
        # Try to parse the file to ensure it's valid JSON
        try:
            with open(data_source, 'r') as f:
                json.load(f)
            return True
        except json.JSONDecodeError:
            return False
  
    def _load_data(self, data_source):
        """Load data from JSON file"""
        self.logger.info(f"Loading data from {data_source}")
      
        with open(data_source, 'r') as f:
            data = json.load(f)
          
        # Ensure data is a list of records
        if isinstance(data, dict):
            # If it's a dict with a records key, use that
            if 'records' in data and isinstance(data['records'], list):
                data = data['records']
            # Otherwise convert to a single-item list
            else:
                data = [data]
              
        self.logger.info(f"Loaded {len(data)} records from JSON")
        return data
  
    def _should_preprocess(self):
        """JSON data often comes pre-structured, might not need preprocessing"""
        return False
  
    def _transform_data(self, data):
        """Transform JSON data by flattening nested structures"""
        self.logger.info("Transforming JSON data")
      
        transformed_data = []
        for item in data:
            # Create a flattened copy of each item
            flat_item = {}
            self._flatten_json(item, flat_item)
            transformed_data.append(flat_item)
          
        return transformed_data
  
    def _flatten_json(self, nested_json, flat_json, prefix=''):
        """Helper method to flatten nested JSON structures"""
        for key, value in nested_json.items():
            if isinstance(value, dict):
                self._flatten_json(value, flat_json, f"{prefix}{key}_")
            elif isinstance(value, list):
                # For simplicity, just join list items for string lists
                if value and all(isinstance(x, str) for x in value):
                    flat_json[f"{prefix}{key}"] = ", ".join(value)
                else:
                    # Store the length for non-string lists
                    flat_json[f"{prefix}{key}_count"] = len(value)
            else:
                flat_json[f"{prefix}{key}"] = value
  
    def _save_results(self, data):
        """Save processed data back to a JSON file"""
        output_file = os.path.join(
            self.output_dir, 
            f"processed_{self.timestamp}.json"
        )
      
        self.logger.info(f"Saving {len(data)} records to {output_file}")
      
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
          
        return len(data)
```

Now let's use our processors:

```python
# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create processors
csv_processor = CSVDataProcessor(output_dir="./processed")
json_processor = JSONDataProcessor(output_dir="./processed")

# Process different data sources
csv_result = csv_processor.process_data("sales_data.csv")
json_result = json_processor.process_data("customer_data.json")

print(f"CSV processing {'succeeded' if csv_result else 'failed'}")
print(f"JSON processing {'succeeded' if json_result else 'failed'}")
```

## Template Method with Type Hints and Python 3.10+ Features

Let's modernize our implementation using Python's type hints and newer language features:

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union, TypeVar, Generic, Protocol
import time
import logging
from pathlib import Path

# Define type variables and protocols
T = TypeVar('T')  # Raw data type
U = TypeVar('U')  # Processed data type

class DataSource(Protocol):
    """Protocol defining what can be used as a data source"""
    def __str__(self) -> str:
        ...

class DataProcessor(ABC, Generic[T, U]):
    """Modern implementation of the data processor template"""
  
    def __init__(self, logger: Optional[logging.Logger] = None) -> None:
        self.logger = logger or logging.getLogger(self.__class__.__name__)
        self.stats: Dict[str, Union[int, float]] = {
            "records_processed": 0,
            "errors": 0,
            "processing_time": 0
        }
  
    def process_data(self, data_source: DataSource) -> bool:
        """Template method defining the data processing pipeline."""
        self.logger.info(f"Starting data processing on {data_source}")
      
        try:
            # Initialize resources
            self._initialize()
          
            # Validate input
            if not self._validate_input(data_source):
                self.logger.error(f"Invalid input source: {data_source}")
                return False
          
            # Load data
            start_time = time.time()
            raw_data: T = self._load_data(data_source)
          
            # Pre-process data (hook)
            match self._should_preprocess():
                case True:
                    processed_data = self._preprocess_data(raw_data)
                case _:
                    processed_data = raw_data
          
            # Transform data
            transformed_data: U = self._transform_data(processed_data)
          
            # Apply business rules (hook)
            final_data = self._apply_business_rules(transformed_data)
          
            # Save results
            records_saved = self._save_results(final_data)
            self.stats["records_processed"] = records_saved
          
            end_time = time.time()
            self.stats["processing_time"] = end_time - start_time
          
            # Generate report (hook)
            self._generate_report()
          
            success = True
        except Exception as e:
            self.logger.exception(f"Error during processing: {str(e)}")
            self.stats["errors"] += 1
            success = False
        finally:
            # Clean up resources
            self._cleanup()
          
        return success
  
    def _initialize(self) -> None:
        """Initialize resources needed for processing"""
        self.logger.debug("Initializing resources")
  
    @abstractmethod
    def _validate_input(self, data_source: DataSource) -> bool:
        """Validate the input data source."""
        pass
  
    @abstractmethod
    def _load_data(self, data_source: DataSource) -> T:
        """Load data from the source."""
        pass
  
    def _should_preprocess(self) -> bool:
        """Hook method to determine if preprocessing is needed."""
        return True
  
    def _preprocess_data(self, data: T) -> T:
        """Hook method for preprocessing data."""
        self.logger.debug("Preprocessing data")
        return data
  
    @abstractmethod
    def _transform_data(self, data: T) -> U:
        """Transform the preprocessed data."""
        pass
  
    def _apply_business_rules(self, data: U) -> U:
        """Hook method to apply business rules to the transformed data."""
        self.logger.debug("Applying business rules")
        return data
  
    @abstractmethod
    def _save_results(self, data: U) -> int:
        """Save the processed results."""
        pass
  
    def _generate_report(self) -> None:
        """Hook method to generate a processing report."""
        self.logger.info(f"Processing completed. Stats: {self.stats}")
  
    def _cleanup(self) -> None:
        """Clean up any resources used during processing."""
        self.logger.debug("Cleaning up resources")
```

## Benefits of the Template Method Pattern

1. **Reuse of Common Code** : Avoids duplication by implementing common algorithm steps in the base class
2. **Controlled Extensions** : Subclasses can extend only specific parts of the algorithm
3. **Inversion of Control** : Base class controls the algorithm flow, not the subclasses
4. **Consistent Algorithm Structure** : All implementations follow the same steps in the same order
5. **Clear Extension Points** : Developers know exactly what they can and must override

## Variations and Extensions of the Template Method Pattern

### Template Method with Strategy

The Template Method can be combined with the Strategy pattern to allow algorithm steps to be configured at runtime:

```python
from abc import ABC, abstractmethod
from typing import Protocol, List, Callable, Optional

# Strategy interfaces
class ValidationStrategy(Protocol):
    def validate(self, data: List[dict]) -> bool:
        ...

class TransformationStrategy(Protocol):
    def transform(self, data: List[dict]) -> List[dict]:
        ...

# Template Method with Strategy pattern
class ConfigurableDataProcessor(ABC):
    """Data processor that uses strategies for some steps"""
  
    def __init__(self, 
                 validator: Optional[ValidationStrategy] = None,
                 transformer: Optional[TransformationStrategy] = None):
        self.validator = validator
        self.transformer = transformer
  
    def process_data(self, data: List[dict]) -> List[dict]:
        """Template method using strategies for some steps"""
        # Prepare data
        prepared_data = self._prepare_data(data)
      
        # Validate using strategy if provided
        if self.validator and not self.validator.validate(prepared_data):
            raise ValueError("Data validation failed")
      
        # Transform data using base template method
        base_transformed = self._transform_data(prepared_data)
      
        # Additional transformation using strategy if provided
        if self.transformer:
            final_data = self.transformer.transform(base_transformed)
        else:
            final_data = base_transformed
      
        # Save results
        return self._save_results(final_data)
  
    @abstractmethod
    def _prepare_data(self, data: List[dict]) -> List[dict]:
        pass
  
    def _transform_data(self, data: List[dict]) -> List[dict]:
        """Default transformation - can be overridden"""
        return data
  
    @abstractmethod
    def _save_results(self, data: List[dict]) -> List[dict]:
        pass
```

### Functional Template Method

In modern Python, we can implement a functional version using higher-order functions:

```python
from typing import Callable, TypeVar, List, Dict, Any, Optional

T = TypeVar('T')  # Input type
U = TypeVar('U')  # Output type

def create_processor(
    validate_fn: Callable[[T], bool],
    load_fn: Callable[[T], List[Dict[str, Any]]],
    transform_fn: Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]],
    save_fn: Callable[[List[Dict[str, Any]]], int],
    preprocess_fn: Optional[Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]]] = None,
    postprocess_fn: Optional[Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]]] = None
) -> Callable[[T], bool]:
    """
    Create a data processor function using the template method pattern.
  
    Args:
        validate_fn: Function to validate the input
        load_fn: Function to load data from the input
        transform_fn: Function to transform the data
        save_fn: Function to save the processed data
        preprocess_fn: Optional function for preprocessing (default: identity)
        postprocess_fn: Optional function for postprocessing (default: identity)
  
    Returns:
        A function that processes data according to the template
    """
    def process_data(input_data: T) -> bool:
        """Process data according to the template method"""
        try:
            # Validate
            if not validate_fn(input_data):
                print(f"Validation failed for {input_data}")
                return False
          
            # Load
            raw_data = load_fn(input_data)
          
            # Preprocess (if provided)
            if preprocess_fn:
                processed_data = preprocess_fn(raw_data)
            else:
                processed_data = raw_data
          
            # Transform
            transformed_data = transform_fn(processed_data)
          
            # Postprocess (if provided)
            if postprocess_fn:
                final_data = postprocess_fn(transformed_data)
            else:
                final_data = transformed_data
          
            # Save
            records_saved = save_fn(final_data)
            print(f"Saved {records_saved} records")
          
            return True
        except Exception as e:
            print(f"Error processing data: {str(e)}")
            return False
  
    return process_data
```

Using the functional template:

```python
# Define component functions
def validate_csv(file_path: str) -> bool:
    return file_path.endswith('.csv') and os.path.exists(file_path)

def load_csv(file_path: str) -> List[Dict[str, Any]]:
    with open(file_path, 'r', newline='') as f:
        return list(csv.DictReader(f))


def transform_sales_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for row in data:
        if 'quantity' in row and 'price' in row:
            # Convert string values to numbers if needed
            quantity = float(row['quantity']) if isinstance(row['quantity'], str) else row['quantity']
            price = float(row['price']) if isinstance(row['price'], str) else row['price']
            row['total'] = quantity * price
    return data

def save_to_json(data: List[Dict[str, Any]]) -> int:
    with open('processed_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    return len(data)

# Create a processor function using our template
process_sales_csv = create_processor(
    validate_fn=validate_csv,
    load_fn=load_csv,
    transform_fn=transform_sales_data,
    save_fn=save_to_json
)

# Use the processor
success = process_sales_csv('sales_data.csv')
print(f"Processing {'succeeded' if success else 'failed'}")
```

This functional approach achieves the same goals as the class-based Template Method but leverages Python's first-class functions to create a more flexible composition.

## When to Use the Template Method Pattern

The Template Method pattern is particularly useful when:

1. **Multiple algorithms share similar steps but with different implementations**: You want to extract the common structure while allowing for variation in specific steps.

2. **You want to control how subclasses extend an algorithm**: You need to let subclasses extend only certain parts of a larger algorithm, while ensuring the overall structure remains intact.

3. **You need to eliminate code duplication in similar algorithms**: When several classes do the same things with slight variations, the Template Method helps avoid redundancy.

4. **You're building a framework that requires customization**: Template Method is excellent for framework design where you define the skeleton of operations and let users customize specific steps.

5. **You want to enforce a specific workflow**: The pattern ensures that certain steps are always executed in a particular order.

## When Not to Use the Template Method Pattern

The Template Method may not be appropriate when:

1. **Algorithms have fundamentally different structures**: If the algorithms don't share a common sequence of steps, forcing them into a template can create unnecessary complexity.

2. **The base algorithm changes frequently**: If the template method itself needs to change often, subclasses will be affected, potentially breaking existing code.

3. **The overhead of inheritance isn't justified**: For simple cases, functional composition or delegation might be clearer and more flexible.

4. **The number of hooks or extension points creates confusion**: Too many customizable steps can make it difficult for subclass developers to understand what they should implement.

## Real-World Example: Web Framework Request Handlers

A common application of the Template Method pattern is in web frameworks. Let's implement a simple request handler framework:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json

class HTTPRequest:
    """Simple HTTP request representation"""
    
    def __init__(self, method: str, path: str, headers: Dict[str, str], body: str = ""):
        self.method = method
        self.path = path
        self.headers = headers
        self.body = body
        self._parsed_body: Optional[Dict[str, Any]] = None
    
    @property
    def json_body(self) -> Dict[str, Any]:
        """Parse and return the request body as JSON"""
        if self._parsed_body is None:
            if self.body:
                self._parsed_body = json.loads(self.body)
            else:
                self._parsed_body = {}
        return self._parsed_body


class HTTPResponse:
    """Simple HTTP response representation"""
    
    def __init__(self, status_code: int = 200, body: Any = None, headers: Optional[Dict[str, str]] = None):
        self.status_code = status_code
        self.body = body
        self.headers = headers or {"Content-Type": "application/json"}
    
    def to_json(self) -> str:
        """Convert the response to a JSON string"""
        if isinstance(self.body, str):
            return self.body
        return json.dumps(self.body)


class RequestHandler(ABC):
    """Base request handler using the Template Method pattern"""
    
    def handle_request(self, request: HTTPRequest) -> HTTPResponse:
        """
        Template method defining the request handling flow.
        This orchestrates the entire HTTP request/response lifecycle.
        """
        # Log the request (hook with default implementation)
        self._log_request(request)
        
        # Authenticate the request (hook with default implementation)
        if not self._authenticate(request):
            return HTTPResponse(401, {"error": "Unauthorized"})
        
        # Parse and validate parameters (hook with default implementation)
        try:
            params = self._parse_parameters(request)
            if not self._validate_parameters(params):
                return HTTPResponse(400, {"error": "Invalid parameters"})
        except Exception as e:
            return HTTPResponse(400, {"error": str(e)})
        
        # Authorize the action (hook with default implementation)
        if not self._authorize(request, params):
            return HTTPResponse(403, {"error": "Forbidden"})
        
        # Process the request (abstract - must be implemented by subclasses)
        try:
            result = self._process_request(request, params)
        except Exception as e:
            # Handle errors (hook with default implementation)
            return self._handle_error(e)
        
        # Format the response (hook with default implementation)
        response = self._format_response(result)
        
        # Log the response (hook with default implementation)
        self._log_response(request, response)
        
        return response
    
    def _log_request(self, request: HTTPRequest) -> None:
        """Log incoming request (hook method)"""
        print(f"Request: {request.method} {request.path}")
    
    def _authenticate(self, request: HTTPRequest) -> bool:
        """
        Authenticate the request (hook method).
        Default implementation accepts all requests.
        """
        return True
    
    def _parse_parameters(self, request: HTTPRequest) -> Dict[str, Any]:
        """
        Parse request parameters (hook method).
        Default implementation returns the JSON body for POST/PUT, empty dict otherwise.
        """
        if request.method in ("POST", "PUT") and request.headers.get("Content-Type") == "application/json":
            return request.json_body
        return {}
    
    def _validate_parameters(self, params: Dict[str, Any]) -> bool:
        """
        Validate request parameters (hook method).
        Default implementation accepts all parameters.
        """
        return True
    
    def _authorize(self, request: HTTPRequest, params: Dict[str, Any]) -> bool:
        """
        Authorize the action (hook method).
        Default implementation allows all actions.
        """
        return True
    
    @abstractmethod
    def _process_request(self, request: HTTPRequest, params: Dict[str, Any]) -> Any:
        """
        Process the request (abstract method).
        This must be implemented by all subclasses to provide the core request handling logic.
        """
        pass
    
    def _handle_error(self, error: Exception) -> HTTPResponse:
        """
        Handle errors during request processing (hook method).
        Default implementation returns a 500 error with the exception message.
        """
        return HTTPResponse(500, {"error": str(error)})
    
    def _format_response(self, result: Any) -> HTTPResponse:
        """
        Format the response (hook method).
        Default implementation returns a 200 response with the result as JSON.
        """
        return HTTPResponse(200, result)
    
    def _log_response(self, request: HTTPRequest, response: HTTPResponse) -> None:
        """
        Log the response (hook method).
        Default implementation prints the response status code.
        """
        print(f"Response: {response.status_code}")
```

Now let's implement some concrete handlers:

```python
class UserGetHandler(RequestHandler):
    """Handler for retrieving user information"""
    
    def __init__(self, user_database: Dict[str, Dict[str, Any]]):
        self.user_database = user_database
    
    def _validate_parameters(self, params: Dict[str, Any]) -> bool:
        """Ensure 'user_id' is present in the request"""
        return "user_id" in params
    
    def _process_request(self, request: HTTPRequest, params: Dict[str, Any]) -> Any:
        """Process a request to get user information"""
        user_id = params["user_id"]
        
        if user_id not in self.user_database:
            # Return 404 when user not found
            return HTTPResponse(404, {"error": f"User {user_id} not found"})
        
        # Return the user data
        return self.user_database[user_id]


class UserCreateHandler(RequestHandler):
    """Handler for creating new users"""
    
    def __init__(self, user_database: Dict[str, Dict[str, Any]]):
        self.user_database = user_database
        self.required_fields = ["username", "email", "full_name"]
    
    def _authenticate(self, request: HTTPRequest) -> bool:
        """Require authentication for user creation"""
        # In a real implementation, this would check tokens, etc.
        return "Authorization" in request.headers
    
    def _validate_parameters(self, params: Dict[str, Any]) -> bool:
        """Validate required user fields"""
        return all(field in params for field in self.required_fields)
    
    def _process_request(self, request: HTTPRequest, params: Dict[str, Any]) -> Any:
        """Process a request to create a user"""
        # Generate a new user ID
        user_id = str(len(self.user_database) + 1)
        
        # Create a new user record
        user_data = {field: params[field] for field in self.required_fields}
        user_data["id"] = user_id
        
        # Store in database
        self.user_database[user_id] = user_data
        
        # Return the created user data with 201 Created status
        return HTTPResponse(201, user_data)
    
    def _format_response(self, result: Any) -> HTTPResponse:
        """Special handling for the created response"""
        if isinstance(result, HTTPResponse):
            return result
        
        # Add a Location header for the new resource
        response = HTTPResponse(201, result)
        if "id" in result:
            response.headers["Location"] = f"/users/{result['id']}"
        
        return response


class AdminUserHandler(UserGetHandler):
    """
    Handler with additional authorization for admin-only user operations.
    Demonstrates how Template Method allows extending parts of the algorithm.
    """
    
    def _authorize(self, request: HTTPRequest, params: Dict[str, Any]) -> bool:
        """Add admin role check"""
        # Check for admin role in a real implementation
        return "Admin-Role" in request.headers
    
    def _process_request(self, request: HTTPRequest, params: Dict[str, Any]) -> Any:
        """Process admin-specific user operations"""
        # First, get the basic user data from the parent class
        user_response = super()._process_request(request, params)
        
        # If it's an error response, return it as is
        if isinstance(user_response, HTTPResponse) and user_response.status_code != 200:
            return user_response
        
        # Add administrative data
        if isinstance(user_response, dict):
            user_response["access_level"] = "Full"
            user_response["account_status"] = "Active"
            user_response["last_login"] = "2023-10-15T14:32:10Z"
        
        return user_response
```

Now, let's use these handlers:

```python
# Setup a simple in-memory user database
user_db = {
    "1": {
        "id": "1",
        "username": "johndoe",
        "email": "john@example.com",
        "full_name": "John Doe"
    },
    "2": {
        "id": "2",
        "username": "janedoe",
        "email": "jane@example.com",
        "full_name": "Jane Doe"
    }
}

# Create handler instances
user_get_handler = UserGetHandler(user_db)
user_create_handler = UserCreateHandler(user_db)
admin_user_handler = AdminUserHandler(user_db)

# Simulate requests
get_request = HTTPRequest(
    method="GET",
    path="/users/1",
    headers={},
    body=json.dumps({"user_id": "1"})
)

create_request = HTTPRequest(
    method="POST",
    path="/users",
    headers={"Content-Type": "application/json", "Authorization": "Bearer token123"},
    body=json.dumps({
        "username": "bobsmith",
        "email": "bob@example.com",
        "full_name": "Bob Smith"
    })
)

admin_request = HTTPRequest(
    method="GET",
    path="/admin/users/1",
    headers={"Admin-Role": "true"},
    body=json.dumps({"user_id": "1"})
)

# Process the requests
print("=== Regular User Get ===")
get_response = user_get_handler.handle_request(get_request)
print(f"Status: {get_response.status_code}")
print(f"Body: {get_response.to_json()}\n")

print("=== User Create ===")
create_response = user_create_handler.handle_request(create_request)
print(f"Status: {create_response.status_code}")
print(f"Headers: {create_response.headers}")
print(f"Body: {create_response.to_json()}\n")

print("=== Admin User Get ===")
admin_response = admin_user_handler.handle_request(admin_request)
print(f"Status: {admin_response.status_code}")
print(f"Body: {admin_response.to_json()}")
```

This web framework example demonstrates several key aspects of the Template Method pattern:

1. The base `RequestHandler` defines the overall request handling flow.
2. Concrete handlers extend only the parts they need to customize.
3. The template method (`handle_request`) ensures that all security checks and logging happen in a consistent way.
4. Hooks allow adding custom behavior at various points in the process.
5. Inheritance enables progressive customization (like the `AdminUserHandler` extending `UserGetHandler`).

## Template Method vs. Strategy Pattern

Both the Template Method and Strategy patterns address algorithm variations, but they do so in different ways:

1. **Template Method** uses inheritance to vary parts of an algorithm. The skeleton is fixed in the parent class, and subclasses override specific steps.

2. **Strategy** uses composition to vary the entire algorithm. Concrete strategies are separate objects that can be switched at runtime.

Here's a comparison:

| Aspect | Template Method | Strategy |
|--------|----------------|----------|
| Variation mechanism | Inheritance | Composition |
| When variation occurs | Compile-time | Runtime |
| What varies | Parts of an algorithm | Entire algorithm |
| Control | Parent class controls flow | Context delegates to strategy |
| Relationship | "Is-a" relationship | "Has-a" relationship |

## Template Method and the Open/Closed Principle

The Template Method pattern adheres well to the Open/Closed Principle (OCP), which states that classes should be open for extension but closed for modification. With Template Method:

1. The base class defines the algorithm structure and is closed for modification.
2. New variants can be created by extending the base class without changing it.
3. Hook methods provide clear extension points.

This makes the pattern ideal for frameworks and libraries where you want to provide extensibility without risking the core algorithm.

## Template Method in Python Standard Library

The Template Method pattern appears in many places in Python's standard library:

1. **`unittest.TestCase`**: Defines the test execution flow with methods like `setUp`, `tearDown`, and `test_*` that you override.

2. **`socketserver` framework**: The `BaseRequestHandler` defines the request handling flow with methods like `setup`, `handle`, and `finish` that subclasses implement.

3. **`concurrent.futures.Executor`**: Defines the execution workflow with methods like `submit` and `map` while subclasses like `ThreadPoolExecutor` implement the specifics.

4. **Abstract Base Classes**: Many ABCs in Python define a template of behavior that concrete classes must implement.

## Handling Default Implementations

A common challenge with the Template Method pattern is deciding between:

1. Abstract methods that subclasses must implement
2. Hook methods with default implementations that subclasses may override

Python offers several approaches:

```python
from abc import ABC, abstractmethod

class AbstractTemplateWithMixedMethods(ABC):
    """Template with both abstract and hook methods"""
    
    def template_method(self):
        """The template method that orchestrates the algorithm"""
        self.required_operation1()  # Abstract - must be implemented
        
        # Hook with default - can be overridden
        if self.should_do_optional():
            self.optional_operation()
            
        self.required_operation2()  # Abstract - must be implemented
    
    @abstractmethod
    def required_operation1(self):
        """Required step 1"""
        pass
    
    @abstractmethod
    def required_operation2(self):
        """Required step 2"""
        pass
    
    def should_do_optional(self):
        """
        Hook method with default implementation.
        Determines whether optional_operation should be called.
        """
        return True
    
    def optional_operation(self):
        """
        Hook method with default implementation.
        Subclasses can override this to provide custom behavior.
        """
        print("Performing default optional operation")
```

## Advanced Template Method with Multiple Extension Points

For complex algorithms with multiple variation points, we can create a more sophisticated Template Method:

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import logging

class ETLPipeline(ABC):
    """Extract-Transform-Load pipeline template"""
    
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(self.__class__.__name__)
        self.metadata: Dict[str, Any] = {}
    
    def execute(self, source_config: Dict[str, Any], target_config: Dict[str, Any]) -> bool:
        """
        Template method for the ETL pipeline.
        Orchestrates the entire extract-transform-load process.
        """
        try:
            # Initialize the pipeline
            self.logger.info("Initializing ETL pipeline")
            self._initialize(source_config, target_config)
            
            # Validate configurations
            self.logger.info("Validating configurations")
            if not self._validate_source(source_config):
                self.logger.error("Source configuration validation failed")
                return False
                
            if not self._validate_target(target_config):
                self.logger.error("Target configuration validation failed")
                return False
            
            # Extract phase
            self.logger.info("Starting data extraction")
            raw_data = self._extract(source_config)
            
            # Record metadata about extraction
            self.metadata["records_extracted"] = len(raw_data)
            self.metadata["extraction_time"] = self._get_timestamp()
            
            # Data validation
            self.logger.info("Validating extracted data")
            if not self._validate_data(raw_data):
                self.logger.error("Data validation failed")
                return False
            
            # Transform phase - with multiple steps
            self.logger.info("Starting data transformation")
            
            # Step 1: Cleanse data
            cleansed_data = self._cleanse_data(raw_data)
            
            # Step 2: Enrich data (optional hook)
            if self._should_enrich_data():
                enriched_data = self._enrich_data(cleansed_data)
            else:
                enriched_data = cleansed_data
            
            # Step 3: Standardize data
            standardized_data = self._standardize_data(enriched_data)
            
            # Final transformation
            transformed_data = self._transform(standardized_data)
            
            # Record metadata about transformation
            self.metadata["records_transformed"] = len(transformed_data)
            self.metadata["transformation_time"] = self._get_timestamp()
            
            # Load phase
            self.logger.info("Starting data loading")
            records_loaded = self._load(transformed_data, target_config)
            
            # Record metadata about loading
            self.metadata["records_loaded"] = records_loaded
            self.metadata["load_time"] = self._get_timestamp()
            
            # Generate reports (optional hook)
            if self._should_generate_reports():
                self._generate_reports()
            
            # Cleanup resources
            self._cleanup()
            
            self.logger.info("ETL pipeline completed successfully")
            return True
            
        except Exception as e:
            self.logger.exception(f"ETL pipeline failed: {str(e)}")
            # Error handling (hook)
            self._handle_error(e)
            return False
    
    def _initialize(self, source_config: Dict[str, Any], target_config: Dict[str, Any]) -> None:
        """Initialize the pipeline (hook with default implementation)"""
        pass
    
    def _validate_source(self, source_config: Dict[str, Any]) -> bool:
        """Validate source configuration (hook with default implementation)"""
        return True
    
    def _validate_target(self, target_config: Dict[str, Any]) -> bool:
        """Validate target configuration (hook with default implementation)"""
        return True
    
    @abstractmethod
    def _extract(self, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract data from the source (abstract method)"""
        pass
    
    def _validate_data(self, data: List[Dict[str, Any]]) -> bool:
        """Validate extracted data (hook with default implementation)"""
        return len(data) > 0
    
    def _cleanse_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleanse the data (hook with default implementation)"""
        return data
    
    def _should_enrich_data(self) -> bool:
        """Determine if data enrichment should be performed (hook)"""
        return False
    
    def _enrich_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enrich the data with additional information (hook)"""
        return data
    
    def _standardize_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Standardize the data format (hook with default implementation)"""
        return data
    
    @abstractmethod
    def _transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform the data (abstract method)"""
        pass
    
    @abstractmethod
    def _load(self, data: List[Dict[str, Any]], target_config: Dict[str, Any]) -> int:
        """Load the data to the target (abstract method)"""
        pass
    
    def _should_generate_reports(self) -> bool:
        """Determine if reports should be generated (hook)"""
        return False
    
    def _generate_reports(self) -> None:
        """Generate reports (hook)"""
        pass
    
    def _cleanup(self) -> None:
        """Clean up resources (hook with default implementation)"""
        pass
    
    def _handle_error(self, error: Exception) -> None:
        """Handle pipeline errors (hook with default implementation)"""
        pass
    
    def _get_timestamp(self) -> str:
        """Helper method to get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
```

This advanced ETL pipeline example demonstrates:
1. A complex algorithm with many steps broken into smaller methods
2. A mix of abstract methods and hooks with default implementations
3. Multiple decision points where subclasses can modify behavior
4. Clear extension points for customization

## Conclusion

The Template Method pattern is a powerful way to structure algorithms with variable parts while maintaining control over the overall flow. In Python, it's particularly effective due to the language's support for inheritance, abstract base classes, and method overriding.

Key takeaways:

1. **Algorithm Structure**: Template Method defines a skeleton algorithm in a base class, with specific steps implemented in subclasses.

2. **Extension Points**: It clearly identifies which parts of an algorithm are fixed and which can be customized.

3. **Code Reuse**: Common steps are implemented once in the base class, eliminating duplication.

4. **Controlled Extension**: The pattern allows extension without modifying the core algorithm structure.

5. **Inversion of Control**: The "Hollywood Principle" (don't call us, we'll call you) is at work, with the parent class calling the subclass methods.

The Template Method pattern is most effective when you have well-defined algorithms with clear variation points. By following this pattern, you create a framework that guides developers to extend your code in controlled ways, leading to more maintainable and flexible systems.