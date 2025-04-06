# React's useMemo Hook: Understanding from First Principles

To understand React's useMemo Hook thoroughly, I'll start with fundamental concepts and progress to advanced applications, providing clear examples throughout.

## 1. The Problem: Expensive Calculations in React Components

React's rendering cycle can run frequently. Every state update, prop change, or context change can cause components to re-render. This creates a potential performance issue: expensive calculations might run repeatedly, even when their inputs haven't changed.

Consider this example:

```javascript
function ProductList({ products, searchTerm }) {
  // This filtering happens on EVERY render
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Imagine this is an expensive calculation
  const totalValue = products.reduce(
    (total, product) => total + product.price * product.quantity, 
    0
  );
  
  return (
    <div>
      <h2>Total Inventory Value: ${totalValue}</h2>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

In this example, if `searchTerm` changes but `products` doesn't, we're unnecessarily recalculating `totalValue`. With a small dataset, this isn't problematic, but with hundreds or thousands of products, it could cause noticeable performance issues.

Traditional JavaScript might solve this with manual caching:

```javascript
// Traditional approach outside React
let cachedProducts = null;
let cachedTotalValue = null;

function calculateTotalValue(products) {
  if (cachedProducts === products) {
    return cachedTotalValue;
  }
  
  cachedProducts = products;
  cachedTotalValue = products.reduce(
    (total, product) => total + product.price * product.quantity, 
    0
  );
  
  return cachedTotalValue;
}
```

But this approach doesn't fit well with React's declarative model and component-based architecture.

## 2. The Mental Model: A Computation Cache with Dependencies

The core mental model for useMemo is that of a "computation cache with dependency tracking." Think of useMemo as creating a special memory cell with these characteristics:

1. It stores the result of an expensive calculation
2. It only recalculates when one of its dependencies changes
3. Otherwise, it returns the cached result from the previous render

This is conceptually similar to how a spreadsheet works: cells with formulas only recalculate when their referenced values change.

## 3. The Basic Syntax and Usage

Here's the basic syntax of useMemo:

```javascript
import { useMemo } from 'react';

function MyComponent() {
  const memoizedValue = useMemo(() => {
    // Perform expensive calculation here
    return computeExpensiveValue(a, b);
  }, [a, b]); // Dependencies array
  
  return <div>{memoizedValue}</div>;
}
```

Let's break down what's happening:

1. We import the useMemo Hook from React
2. We call useMemo with two arguments:
   * A function that returns the value we want to memoize (the "factory function")
   * An array of dependencies that determine when to recalculate
3. React calls the factory function during the first render
4. On subsequent renders, React either:
   * Returns the cached value (if dependencies haven't changed)
   * Recalculates by calling the factory function again (if any dependency changed)

## 4. How useMemo Works Under the Hood

When React processes a useMemo Hook, it:

1. Checks if this is the first render
   * If it is, it calls the factory function and stores the result
   * If not, it compares the current dependencies with the previous render's dependencies
2. If the dependencies haven't changed (compared using Object.is), it returns the stored result
3. If any dependency has changed, it calls the factory function again and stores the new result

React maintains a "memoization cache" for each useMemo call in the component, which is part of the component's fiber in React's internal tree.

## 5. A Simple Example: Memoizing Expensive Calculations

Let's refactor our ProductList example to use useMemo:

```javascript
import { useMemo } from 'react';

function ProductList({ products, searchTerm }) {
  // Memoize the filtered products
  const filteredProducts = useMemo(() => {
    console.log('Calculating filtered products');
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]); // Recalculate when products or searchTerm changes
  
  // Memoize the total value calculation
  const totalValue = useMemo(() => {
    console.log('Calculating total value');
    return products.reduce(
      (total, product) => total + product.price * product.quantity, 
      0
    );
  }, [products]); // Only recalculate when products changes
  
  return (
    <div>
      <h2>Total Inventory Value: ${totalValue}</h2>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

Now:

* If only `searchTerm` changes, only `filteredProducts` recalculates
* If `products` changes, both calculations run
* If something else causes a re-render (like a parent component), neither calculation runs

## 6. When to Use useMemo: Performance Optimization Scenarios

useMemo is not needed for every calculation. Here are the scenarios where it's most valuable:

### Scenario 1: Computationally Expensive Operations

```javascript
function DataAnalytics({ dataPoints }) {
  // Memoize complex statistical calculations
  const statistics = useMemo(() => {
    console.log('Calculating statistics');
    return {
      average: dataPoints.reduce((sum, point) => sum + point, 0) / dataPoints.length,
      median: calculateMedian(dataPoints),
      standardDeviation: calculateStandardDeviation(dataPoints),
      correlations: calculateCorrelationMatrix(dataPoints),
      // More complex calculations...
    };
  }, [dataPoints]);
  
  return (
    <div>
      <h2>Data Analysis</h2>
      <p>Average: {statistics.average}</p>
      <p>Median: {statistics.median}</p>
      <p>Standard Deviation: {statistics.standardDeviation}</p>
      {/* Display more results */}
    </div>
  );
}
```

### Scenario 2: Creating New Objects During Rendering

React's rendering process can cause issues with referential equality. When you create objects or arrays inside a component, they get new references on each render:

```javascript
function MapComponent({ locations }) {
  // 🔴 New object created every render
  const mapOptions = {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    markers: locations.map(loc => ({
      position: { lat: loc.lat, lng: loc.lng },
      title: loc.name
    }))
  };
  
  return <MapView options={mapOptions} />;
}
```

If `MapView` uses referential equality checks (like in `React.memo` or `useEffect` dependencies), it will re-render unnecessarily. useMemo solves this:

```javascript
function MapComponent({ locations }) {
  // ✅ Stable object reference when locations hasn't changed
  const mapOptions = useMemo(() => ({
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    markers: locations.map(loc => ({
      position: { lat: loc.lat, lng: loc.lng },
      title: loc.name
    }))
  }), [locations]);
  
  return <MapView options={mapOptions} />;
}
```

### Scenario 3: Breaking Circular Dependency Chains

Sometimes complex components can create circular dependencies in useEffect hooks. useMemo can help break these cycles:

```javascript
function SearchComponent({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  
  // Memoize the search function to break the dependency cycle
  const executeSearch = useMemo(() => {
    return async (searchQuery) => {
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const data = await response.json();
      setResults(data);
    };
  }, []); // Empty dependencies - stable across renders
  
  // Now we can depend on executeSearch safely
  useEffect(() => {
    executeSearch(query);
  }, [query, executeSearch]);
  
  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
      />
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 7. Common useMemo Patterns

### Pattern 1: Derived State

Derived state is data calculated from props or state:

```javascript
function OrderSummary({ items, taxRate, discountCode }) {
  // Derived state - computed from props
  const { subtotal, discount, tax, total } = useMemo(() => {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
    // Apply discount
    let discount = 0;
    if (discountCode === 'SAVE10') {
      discount = subtotal * 0.1;
    } else if (discountCode === 'SAVE20') {
      discount = subtotal * 0.2;
    }
  
    // Calculate tax
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (taxRate / 100);
  
    // Calculate total
    const total = taxableAmount + tax;
  
    return { subtotal, discount, tax, total };
  }, [items, taxRate, discountCode]);
  
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      <div>Subtotal: ${subtotal.toFixed(2)}</div>
      {discount > 0 && <div>Discount: -${discount.toFixed(2)}</div>}
      <div>Tax: ${tax.toFixed(2)}</div>
      <div className="total">Total: ${total.toFixed(2)}</div>
    </div>
  );
}
```

This pattern is especially useful when:

* The derived data is used in multiple places in the component
* The calculation is complex or iterates over large collections
* The input data doesn't change frequently

### Pattern 2: Memoizing Formatted or Transformed Data

```javascript
function DataTable({ rawData, sortField, sortDirection }) {
  // Memoize the sorting and formatting logic
  const processedData = useMemo(() => {
    console.log('Processing data');
  
    // Create a copy for sorting
    const sorted = [...rawData].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  
    // Transform the data for display
    return sorted.map(item => ({
      ...item,
      formattedDate: new Date(item.timestamp).toLocaleDateString(),
      statusText: getStatusText(item.status),
      colorClass: getColorForStatus(item.status)
    }));
  }, [rawData, sortField, sortDirection]);
  
  return (
    <table>
      <thead>
        {/* Table headers */}
      </thead>
      <tbody>
        {processedData.map(item => (
          <tr key={item.id} className={item.colorClass}>
            <td>{item.name}</td>
            <td>{item.formattedDate}</td>
            <td>{item.statusText}</td>
            {/* More cells */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Pattern 3: Stable References for Nested Data

```javascript
function NestedFilter({ data, onFilterChange }) {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    inStock: true
  });
  
  // Create a stable nested configuration object
  const filterConfig = useMemo(() => ({
    filters: {
      ...filters,
      // Transform the filters into the format expected by the filter system
      priceRange: {
        min: filters.priceRange[0],
        max: filters.priceRange[1]
      }
    },
    options: {
      caseSensitive: false,
      matchAny: false,
      includeDeleted: false
    }
  }), [filters]);
  
  // When the filters change
  useEffect(() => {
    // Apply the filters and notify parent
    const filteredResults = applyFilters(data, filterConfig);
    onFilterChange(filteredResults);
  }, [data, filterConfig, onFilterChange]);
  
  // Render filter controls
  return (
    <div className="filters">
      {/* Filter UI controls */}
    </div>
  );
}
```

## 8. Advanced useMemo Techniques

### Technique 1: Two-Tier Memoization for Hierarchical Data

For complex data structures like trees, you can use a hierarchical memoization approach:

```javascript
function TreeView({ data, expandedNodes }) {
  // First tier: Memoize the processed tree structure
  const processedTree = useMemo(() => {
    console.log('Processing entire tree');
  
    // Deep transform of the tree data
    function processNode(node) {
      return {
        ...node,
        displayName: formatNodeName(node),
        childCount: (node.children || []).length,
        children: (node.children || []).map(processNode)
      };
    }
  
    return processNode(data);
  }, [data]); // Only recompute when source data changes
  
  // Second tier: Memoize the visible nodes based on expanded state
  const visibleNodes = useMemo(() => {
    console.log('Calculating visible nodes');
  
    // Flatten tree to visible nodes based on expanded state
    function getVisibleNodes(node, path = [], result = []) {
      const currentPath = [...path, node.id];
      result.push({
        ...node,
        depth: path.length,
        path: currentPath,
        isExpanded: expandedNodes.includes(node.id)
      });
    
      if (node.children && expandedNodes.includes(node.id)) {
        node.children.forEach(child => {
          getVisibleNodes(child, currentPath, result);
        });
      }
    
      return result;
    }
  
    return getVisibleNodes(processedTree);
  }, [processedTree, expandedNodes]); // Recompute when tree or expanded state changes
  
  return (
    <div className="tree-view">
      {visibleNodes.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          depth={node.depth} 
        />
      ))}
    </div>
  );
}
```

This technique separates concerns:

* The base data structure transformation (which might be expensive but rarely changes)
* The view-specific calculations (which change more frequently)

### Technique 2: Memoizing Selectors (Redux Pattern)

This technique, inspired by Redux's Reselect library, creates memoized selector functions:

```javascript
function Dashboard({ userData, transactions }) {
  // First-level selectors
  const userCategories = useMemo(() => {
    return userData.preferences?.categories || [];
  }, [userData.preferences]);
  
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);
  
  // Second-level selectors that depend on other selectors
  const categorizedTransactions = useMemo(() => {
    return sortedTransactions.reduce((result, transaction) => {
      const category = transaction.category || 'uncategorized';
    
      if (!result[category]) {
        result[category] = [];
      }
    
      result[category].push(transaction);
      return result;
    }, {});
  }, [sortedTransactions]);
  
  // Third-level selectors
  const categorySummaries = useMemo(() => {
    return userCategories.map(category => {
      const transactions = categorizedTransactions[category.id] || [];
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    
      return {
        ...category,
        transactionCount: transactions.length,
        total,
        averageAmount: transactions.length ? total / transactions.length : 0
      };
    });
  }, [userCategories, categorizedTransactions]);
  
  return (
    <div className="dashboard">
      <TransactionList transactions={sortedTransactions} />
      <CategorySummary categories={categorySummaries} />
    </div>
  );
}
```

This pattern creates a pipeline of selectors, each building on the previous ones, with memoization at each step.

### Technique 3: Dynamic Dependencies with Key Changes

Sometimes you need to force recalculation even when the inputs look the same:

```javascript
function DataProcessor({ data, shouldReprocess }) {
  // Use a key to force recalculation when needed
  const [processKey, setProcessKey] = useState(0);
  
  // When explicit reprocessing is requested
  useEffect(() => {
    if (shouldReprocess) {
      // Increment the key to force recalculation
      setProcessKey(prev => prev + 1);
    }
  }, [shouldReprocess]);
  
  // The processKey in dependencies forces recalculation when it changes
  const processedData = useMemo(() => {
    console.log('Processing data with key:', processKey);
    return expensiveDataProcessing(data);
  }, [data, processKey]);
  
  return (
    <div>
      <DataVisualization data={processedData} />
      <button onClick={() => setProcessKey(prev => prev + 1)}>
        Reprocess Data
      </button>
    </div>
  );
}
```

This technique lets you force recalculation on demand, not just when inputs change.

## 9. Common useMemo Pitfalls and Solutions

### Pitfall 1: Premature Optimization

```javascript
function SimpleComponent({ name, age }) {
  // 🔴 Unnecessary: The calculation is too simple to benefit from memoization
  const greeting = useMemo(() => {
    return `Hello, ${name}! You are ${age} years old.`;
  }, [name, age]);
  
  return <div>{greeting}</div>;
}
```

Solution: Only memoize calculations that are actually expensive or where referential equality matters.

### Pitfall 2: Missing Dependencies

```javascript
function ProductTable({ products, taxRate }) {
  // 🔴 Missing dependency: taxRate is used but not listed
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      priceWithTax: product.price * (1 + taxRate / 100)
    }));
  }, [products]); // Missing taxRate in dependencies
  
  return (
    <table>
      {/* Table rendering */}
    </table>
  );
}
```

Solution: Always include all values used in the calculation in the dependency array. React's ESLint rules can help catch these.

### Pitfall 3: Non-Primitive Dependencies Causing Excess Recalculation

```javascript
function SearchResults({ query }) {
  // 🔴 Problem: New object created every render
  const searchConfig = { 
    term: query,
    caseSensitive: false,
    fuzzy: true
  };
  
  // This will recalculate every time because searchConfig is a new object
  const results = useMemo(() => {
    return performSearch(searchConfig);
  }, [searchConfig]); // A new object reference every time
  
  return <ResultsList results={results} />;
}
```

Solutions:

1. Use primitive dependencies where possible:

```javascript
function SearchResults({ query }) {
  // ✅ Using primitives as dependencies
  const caseSensitive = false;
  const fuzzy = true;
  
  const results = useMemo(() => {
    const searchConfig = { 
      term: query,
      caseSensitive,
      fuzzy
    };
    return performSearch(searchConfig);
  }, [query, caseSensitive, fuzzy]); // Primitive values
  
  return <ResultsList results={results} />;
}
```

2. Memoize the object itself:

```javascript
function SearchResults({ query }) {
  // ✅ Memoize the configuration object
  const searchConfig = useMemo(() => ({ 
    term: query,
    caseSensitive: false,
    fuzzy: true
  }), [query]);
  
  // Now this only recalculates when searchConfig changes
  const results = useMemo(() => {
    return performSearch(searchConfig);
  }, [searchConfig]);
  
  return <ResultsList results={results} />;
}
```

### Pitfall 4: Deep Equality vs. Reference Equality

React's useMemo uses reference equality (Object.is) to compare dependencies, not deep equality:

```javascript
function DeepDataComponent({ config }) {
  // 🔴 Problem: Even if the contents are the same, a new object reference
  // will cause recalculation
  const processedData = useMemo(() => {
    console.log('Processing with config:', config);
    return heavyProcessing(config.settings);
  }, [config]); // This depends on reference equality
  
  return <DataDisplay data={processedData} />;
}
```

Solutions:

1. Extract primitive values:

```javascript
function DeepDataComponent({ config }) {
  // ✅ Extract the specific values that matter
  const { maxItems, threshold, category } = config.settings;
  
  const processedData = useMemo(() => {
    console.log('Processing with specific settings');
    return heavyProcessing({ maxItems, threshold, category });
  }, [maxItems, threshold, category]); // Primitive dependencies
  
  return <DataDisplay data={processedData} />;
}
```

2. Use custom comparison in a useEffect to update a local state:

```javascript
function DeepDataComponent({ config }) {
  // Track our own version of the config
  const [localConfig, setLocalConfig] = useState(config);
  
  // Update local config only when deep contents change
  useEffect(() => {
    if (!isEqual(config, localConfig)) { // Using a deep equality function
      setLocalConfig(config);
    }
  }, [config, localConfig]);
  
  // Now we use our stable localConfig
  const processedData = useMemo(() => {
    console.log('Processing with local config');
    return heavyProcessing(localConfig.settings);
  }, [localConfig]); // Only changes when contents actually change
  
  return <DataDisplay data={processedData} />;
}
```

## 10. useMemo vs. Other React Patterns

### useMemo vs. React.memo

While they sound similar, they serve different purposes:

```javascript
// React.memo: Memoizes an entire component based on props
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{expensiveCalculation(props)}</div>;
});

// useMemo: Memoizes a value inside a component
function MyComponent(props) {
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(props);
  }, [props.a, props.b]);
  
  return <div>{memoizedValue}</div>;
}
```

Key differences:

* React.memo prevents unnecessary re-renders of the entire component
* useMemo prevents recalculation of values within a component that's rendering
* React.memo compares props shallowly by default
* useMemo lets you specify exactly which dependencies should trigger recalculation

### useMemo vs. useCallback

useCallback memoizes functions, while useMemo memoizes values:

```javascript
function SearchComponent({ query }) {
  // useCallback: Memoizes a function
  const handleSearch = useCallback(() => {
    performSearch(query);
  }, [query]);
  
  // useMemo: Memoizes a value (in this case, a function)
  const handleSearchAlt = useMemo(() => {
    return () => performSearch(query);
  }, [query]);
  
  // They are functionally equivalent in this case
  // But generally, useCallback is clearer for functions
}
```

Key differences:

* useCallback(fn, deps) is equivalent to useMemo(() => fn, deps)
* useCallback is optimized for and more semantically clear for function memoization
* useMemo is more versatile for any value type

### useMemo vs. Computed Properties in Class Components

Before Hooks, class components used different patterns:

```javascript
// Class component approach
class ProductTable extends React.Component {
  // Compute derived data from props
  get processedProducts() {
    const { products, taxRate } = this.props;
    return products.map(product => ({
      ...product,
      priceWithTax: product.price * (1 + taxRate / 100)
    }));
  }
  
  render() {
    // This recalculates every render
    const processedProducts = this.processedProducts;
  
    return (
      <table>
        {/* Table rendering using processedProducts */}
      </table>
    );
  }
}

// Hook approach
function ProductTable({ products, taxRate }) {
  // This only recalculates when dependencies change
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      priceWithTax: product.price * (1 + taxRate / 100)
    }));
  }, [products, taxRate]);
  
  return (
    <table>
      {/* Table rendering using processedProducts */}
    </table>
  );
}
```

The Hook approach gives you more control over when recalculations happen.

## 11. A Complete Real-World Example

Let's build a complete component that demonstrates useMemo best practices:

```javascript
import { useState, useMemo, useCallback } from 'react';

function DataAnalysisDashboard({ rawData, initialFilters }) {
  // State for filters
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState({
    field: 'date',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState('table');
  
  // First level: Filter the data
  const filteredData = useMemo(() => {
    console.log('Filtering data');
  
    return rawData.filter(item => {
      // Apply category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }
  
      // Apply date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.date);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }
  
      // Apply search filter
      if (filters.searchTerm && !item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
  
      return true;
    });
  }, [rawData, filters.category, filters.dateRange, filters.searchTerm]);
  
  // Second level: Sort the filtered data
  const sortedData = useMemo(() => {
    console.log('Sorting data');
  
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
  
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
    });
  }, [filteredData, sortConfig.field, sortConfig.direction]);
  
  // Third level: Calculate statistics
  const statistics = useMemo(() => {
    console.log('Calculating statistics');
  
    // Skip expensive calculation if no data
    if (filteredData.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0
      };
    }
  
    const values = filteredData.map(item => item.value);
  
    return {
      count: values.length,
      total: values.reduce((sum, val) => sum + val, 0),
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [filteredData]);
  
  // Fourth level: Prepare data for current view mode
  const viewData = useMemo(() => {
    console.log('Preparing view data');
  
    if (viewMode === 'table') {
      return sortedData.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString(),
        formattedValue: `$${item.value.toFixed(2)}`
      }));
    } else if (viewMode === 'chart') {
      // Group by date for the chart
      const groupedByDate = sortedData.reduce((result, item) => {
        const date = new Date(item.date).toLocaleDateString();
    
        if (!result[date]) {
          result[date] = {
            date,
            totalValue: 0,
            count: 0
          };
        }
    
        result[date].totalValue += item.value;
        result[date].count += 1;
    
        return result;
      }, {});
  
      return Object.values(groupedByDate).map(group => ({
        ...group,
        averageValue: group.totalValue / group.count
      }));
    }
  
    return sortedData;
  }, [sortedData, viewMode]);
  
  // Memoized event handlers
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);
  
  const handleSort = useCallback((field) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        // Toggle direction if same field
        return {
          field,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New field, default to descending
        return {
          field,
          direction: 'desc'
        };
      }
    });
  }, []);
  
  // Render the component
  return (
    <div className="dashboard">
      <FilterPanel 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
  
      <div className="view-controls">
        <button 
          className={viewMode === 'table' ? 'active' : ''}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
        <button 
          className={viewMode === 'chart' ? 'active' : ''}
          onClick={() => setViewMode('chart')}
        >
          Chart View
        </button>
      </div>

      <div className="statistics">
        <div className="stat-card">
          <h3>Total Items</h3>
          <div className="stat-value">{statistics.count}</div>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <div className="stat-value">${statistics.total.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h3>Average Value</h3>
          <div className="stat-value">${statistics.average.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h3>Range</h3>
          <div className="stat-value">${statistics.min.toFixed(2)} - ${statistics.max.toFixed(2)}</div>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <DataTable 
          data={viewData}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      ) : (
        <DataChart data={viewData} />
      )}
    </div>
  );
}

// Supporting components would be defined elsewhere
function FilterPanel({ filters, onFilterChange }) {
  // Component implementation
}

function DataTable({ data, sortConfig, onSort }) {
  // Component implementation
}

function DataChart({ data }) {
  // Component implementation
}
```

This example demonstrates a multi-level memoization strategy:
1. Each calculation builds on the previous one in a logical pipeline
2. Each step has its own focused dependencies
3. We separate transformations with different purposes (filtering, sorting, statistics, view formatting)
4. Event handlers are memoized with useCallback to prevent unnecessary rerenders in child components
5. The final UI is composed based on these memoized values

This approach makes the component both efficient and maintainable. If any one stage of the pipeline changes, only the affected calculations and their dependents need to recalculate.

## 12. useMemo and Server Components

In modern React with Server Components, the usage patterns for useMemo change. Server Components are rendered once on the server, so they don't need optimization for repeated rendering. For Client Components, useMemo remains important:

```javascript
// Server Component
// No useMemo needed as it only renders once on the server
async function ProductListingPage({ category }) {
  const products = await fetchProductsByCategory(category);
  
  // Even expensive calculations run only once on the server
  const featuredProducts = products
    .filter(p => p.featured)
    .sort((a, b) => b.popularity - a.popularity);
  
  return (
    <div>
      <h1>{category} Products</h1>
      <ClientProductFilters products={products} />
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}

// Client Component - still needs useMemo
"use client";
function ClientProductFilters({ products }) {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    inStock: false
  });
  
  // useMemo is still valuable in Client Components
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      if (filters.inStock && !product.inStock) {
        return false;
      }
      return true;
    });
  }, [products, filters.minPrice, filters.maxPrice, filters.inStock]);
  
  return (
    <div>
      {/* Filter controls */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
```

In this hybrid approach:
- Expensive initial calculations happen once on the server
- Interactive filtering that requires client-side rendering still benefits from useMemo
- You can strategically split your components to optimize where computations happen

## 13. Performance Measurement and Optimization

To determine if useMemo is actually improving performance, you need to measure:

```javascript
function OptimizedComponent({ data }) {
  // Measure without memoization
  const startTimeWithout = performance.now();
  const resultWithoutMemo = expensiveCalculation(data);
  const endTimeWithout = performance.now();
  
  // Measure with memoization
  const startTimeWith = performance.now();
  const resultWithMemo = useMemo(() => expensiveCalculation(data), [data]);
  const endTimeWith = performance.now();
  
  console.log(`Without memo: ${endTimeWithout - startTimeWithout}ms`);
  console.log(`With memo: ${endTimeWith - startTimeWith}ms`);
  
  return <div>{/* Component content */}</div>;
}
```

This is a simplistic example for illustration. In practice, use React's built-in profiling tools:

1. React DevTools Profiler
2. The `<Profiler>` component to measure render times programmatically

```javascript
import { Profiler } from 'react';

function ProfiledComponent({ data }) {
  const handleRender = (
    id, // the "id" prop of the Profiler tree that just committed
    phase, // "mount" or "update"
    actualDuration, // time spent rendering
    baseDuration, // estimated time for a full rebuild
    startTime, // when React began rendering
    commitTime // when React committed the updates
  ) => {
    console.log(`${id} ${phase}: Actual: ${actualDuration}ms, Base: ${baseDuration}ms`);
  };
  
  return (
    <Profiler id="DataProcessor" onRender={handleRender}>
      <DataProcessor data={data} />
    </Profiler>
  );
}
```

Remember to only optimize components that show measurable performance issues. Premature optimization can make your code more complex without meaningful benefits.

## 14. useMemo and TypeScript

With TypeScript, you can add type safety to your useMemo usage:

```typescript
// Define the return type of the memoized calculation
function ProductAnalytics({ products }: { products: Product[] }) {
  // Explicitly specify the return type
  const analytics = useMemo<Analytics>(() => {
    return {
      totalProducts: products.length,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      categories: [...new Set(products.map(p => p.category))],
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price))
      }
    };
  }, [products]);
  
  return (
    <div>
      <h2>Product Analytics</h2>
      <p>Total Products: {analytics.totalProducts}</p>
      <p>Average Price: ${analytics.averagePrice.toFixed(2)}</p>
      <p>Categories: {analytics.categories.join(', ')}</p>
      <p>Price Range: ${analytics.priceRange.min} - ${analytics.priceRange.max}</p>
    </div>
  );
}

// Type definitions
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface Analytics {
  totalProducts: number;
  averagePrice: number;
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
}
```

TypeScript helps catch errors when:
- The calculation returns an incorrect shape
- You try to access properties that don't exist
- You pass the wrong types of dependencies

## 15. Testing Components with useMemo

Testing components with useMemo requires specific techniques:

```javascript
// Component with useMemo
function SortedList({ items }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.localeCompare(b));
  }, [items]);
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

// Test with React Testing Library
import { render, screen } from '@testing-library/react';

test('sorts items alphabetically', () => {
  // Arrange: Create test data
  const unsortedItems = ['banana', 'apple', 'cherry'];
  
  // Act: Render component
  render(<SortedList items={unsortedItems} />);
  
  // Assert: Items should be sorted
  const listItems = screen.getAllByRole('listitem');
  expect(listItems).toHaveLength(3);
  expect(listItems[0]).toHaveTextContent('apple');
  expect(listItems[1]).toHaveTextContent('banana');
  expect(listItems[2]).toHaveTextContent('cherry');
});

test('recalculates when items change', () => {
  // Arrange: Create a spy on console.log
  jest.spyOn(console, 'log').mockImplementation(() => {});
  
  // Custom component that logs to verify memoization
  function LoggingSortedList({ items }) {
    const sortedItems = useMemo(() => {
      console.log('Sorting items'); // Add logging
      return [...items].sort((a, b) => a.localeCompare(b));
    }, [items]);
    
    return (
      <ul>
        {sortedItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  
  // Act: Initial render
  const { rerender } = render(<LoggingSortedList items={['c', 'b', 'a']} />);
  
  // Assert: Calculation happened once
  expect(console.log).toHaveBeenCalledWith('Sorting items');
  expect(console.log).toHaveBeenCalledTimes(1);
  
  // Act: Rerender with same props
  console.log.mockClear();
  rerender(<LoggingSortedList items={['c', 'b', 'a']} />);
  
  // Assert: Calculation was skipped
  expect(console.log).not.toHaveBeenCalled();
  
  // Act: Rerender with different props
  console.log.mockClear();
  rerender(<LoggingSortedList items={['d', 'e', 'f']} />);
  
  // Assert: Calculation happened again
  expect(console.log).toHaveBeenCalledWith('Sorting items');
  expect(console.log).toHaveBeenCalledTimes(1);
  
  // Clean up
  console.log.mockRestore();
});
```

Key testing techniques:
- Verify that the calculation produces the correct results
- Verify that memoization works by checking that calculations only run when dependencies change
- Use mocks to detect when calculations occur
- Use rerender to test different props

## 16. Conclusion: Mental Models for useMemo

To master useMemo, keep these mental models in mind:

### 1. Cache with Dependencies

Think of useMemo as a cache with a dependency-based invalidation strategy:

```javascript
// Mental model: "Cache this calculation and only recalculate when dependencies change"
const cachedValue = useMemo(() => {
  // Expensive calculation
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### 2. Optimizing Your Component's Re-render Cycle

View useMemo as a way to skip unnecessary work during renders:

```javascript
function OptimizedChart({ data, width, height }) {
  // Mental model: "Don't recalculate these values on every render"
  
  // Layout calculations depend only on width and height
  const layout = useMemo(() => {
    return calculateChartLayout(width, height);
  }, [width, height]);
  
  // Data processing depends only on the input data
  const processedData = useMemo(() => {
    return processChartData(data);
  }, [data]);
  
  // Drawing combines layout and processed data
  const chartElements = useMemo(() => {
    return generateChartElements(processedData, layout);
  }, [processedData, layout]);
  
  return <svg>{chartElements}</svg>;
}
```

### 3. Creating Stable References

useMemo creates stable references that don't change unless dependencies change:

```javascript
function ParentComponent() {
  // Mental model: "Create a stable object reference that doesn't change on every render"
  const options = useMemo(() => {
    return {
      theme: 'dark',
      animations: true,
      precision: 2
    };
  }, []); // Empty dependencies - never changes
  
  return <ChildComponent options={options} />;
}
```

### 4. Value Derivation Pipeline

Think of useMemo as creating a pipeline of derived values:

```javascript
function DataFlow({ rawData }) {
  // Mental model: "Build a pipeline of data transformations"
  
  // Stage 1: Filter
  const filteredData = useMemo(() => {
    return filterData(rawData);
  }, [rawData]);
  
  // Stage 2: Process (depends on filtered data)
  const processedData = useMemo(() => {
    return processData(filteredData);
  }, [filteredData]);
  
  // Stage 3: Format (depends on processed data)
  const formattedData = useMemo(() => {
    return formatData(processedData);
  }, [processedData]);
  
  return <DataDisplay data={formattedData} />;
}
```

### 5. Decision Tree for Using useMemo

When deciding whether to use useMemo, consider:

1. Is the calculation expensive? (Takes measurable time)
   - Yes: Consider useMemo
   - No: Probably don't need useMemo

2. Is the result used for referential equality in other hooks?
   - Yes: Consider useMemo even for simple calculations
   - No: Only use useMemo for expensive calculations

3. How often will the dependencies change?
   - Rarely: Higher benefit from useMemo
   - Very frequently: Might not be worth the overhead

4. Is this a leaf component rendered many times?
   - Yes: Higher benefit from useMemo
   - No: Less benefit if the component has few instances

Understanding these mental models will help you apply useMemo effectively in your React applications. Remember that premature optimization can make your code more complex without meaningful benefits, so use useMemo judiciously where it provides real performance improvements or helps maintain referential stability for other hooks.