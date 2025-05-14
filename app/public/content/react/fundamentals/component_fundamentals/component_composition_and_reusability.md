# Component Composition and Reusability in React

Component composition and reusability represent the foundational principles that make React powerful, elegant, and efficient. Let's explore these concepts from first principles, building our understanding step by step.

## The First Principle: Composability

> "Simple components can be combined to form complex interfaces."

At its heart, React embraces the philosophy of building user interfaces through composition rather than inheritance. This concept stems from functional programming principles where small, focused pieces combine to create sophisticated systems.

### What is Composition?

In the physical world, composition is everywhere. Consider LEGO bricks - simple individual pieces that combine to create elaborate structures. Each brick has a specific purpose, and when assembled together, they form something greater than the sum of their parts.

In software, composition follows the same principle. Rather than creating large, monolithic pieces of code, we build small, focused components that we can combine in various ways.

Let's demonstrate with a simple example:

```jsx
// A simple Button component
function Button({ children, onClick }) {
  return (
    <button 
      className="bg-blue-500 text-white py-2 px-4 rounded" 
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Using our Button in different components
function LoginForm() {
  return (
    <form>
      {/* Form fields here */}
      <Button onClick={() => console.log('Login clicked')}>
        Login
      </Button>
    </form>
  );
}

function SignupPrompt() {
  return (
    <div>
      <p>Don't have an account?</p>
      <Button onClick={() => console.log('Signup clicked')}>
        Create Account
      </Button>
    </div>
  );
}
```

In the example above, the `Button` component is reused in two different contexts. We've composed larger interface pieces (a form and a prompt) using a smaller, reusable piece (the button).

## The Second Principle: Single Responsibility

> "Each component should do one thing, and do it well."

This principle, borrowed from the UNIX philosophy and the Single Responsibility Principle in software design, guides us to create components that have one clear purpose.

### Benefits of Single Responsibility

1. **Easier to understand** : When a component has a single focus, developers can quickly grasp what it does
2. **Easier to test** : Smaller, focused components are simpler to write tests for
3. **Easier to reuse** : Components with a single responsibility are more likely to be reusable in different contexts

Let's see an example:

```jsx
// BAD: A component doing too many things
function UserProfilePage({ user }) {
  return (
    <div>
      <header>
        <h1>{user.name}</h1>
        <img src={user.avatar} alt={user.name} />
        <button onClick={() => followUser(user.id)}>Follow</button>
      </header>
      <section>
        <h2>Recent Posts</h2>
        {user.posts.map(post => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div>
              <button onClick={() => likePost(post.id)}>Like</button>
              <button onClick={() => sharePost(post.id)}>Share</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// BETTER: Breaking it down into focused components
function UserHeader({ user, onFollow }) {
  return (
    <header>
      <h1>{user.name}</h1>
      <img src={user.avatar} alt={user.name} />
      <button onClick={onFollow}>Follow</button>
    </header>
  );
}

function PostItem({ post, onLike, onShare }) {
  return (
    <div>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <div>
        <button onClick={onLike}>Like</button>
        <button onClick={onShare}>Share</button>
      </div>
    </div>
  );
}

function UserProfilePage({ user }) {
  const handleFollow = () => followUser(user.id);
  
  return (
    <div>
      <UserHeader user={user} onFollow={handleFollow} />
      <section>
        <h2>Recent Posts</h2>
        {user.posts.map(post => (
          <PostItem 
            key={post.id}
            post={post}
            onLike={() => likePost(post.id)}
            onShare={() => sharePost(post.id)}
          />
        ))}
      </section>
    </div>
  );
}
```

Notice how breaking the large component into smaller ones makes each piece more focused and reusable. The `PostItem` component could be used in different contexts, not just in a user profile.

## The Third Principle: Props as Configuration

> "Components are configured through their props."

Props are how React components communicate with each other. They allow us to pass data from parent to child components, making our components configurable and flexible.

```jsx
// A reusable Card component configured through props
function Card({ title, children, variant = "default" }) {
  // Different styling based on variant prop
  const variantClasses = {
    default: "bg-white border border-gray-200",
    primary: "bg-blue-50 border border-blue-200",
    warning: "bg-yellow-50 border border-yellow-200",
  };
  
  return (
    <div className={`p-4 rounded ${variantClasses[variant]}`}>
      {title && <h2 className="text-xl mb-2">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}

// Using the Card component in different ways
function Dashboard() {
  return (
    <div>
      <Card title="Welcome">
        <p>Welcome to your dashboard!</p>
      </Card>
    
      <Card title="Warning" variant="warning">
        <p>Your subscription expires in 3 days.</p>
      </Card>
    
      <Card variant="primary">
        <p>This is a primary card without a title.</p>
      </Card>
    </div>
  );
}
```

In this example, the `Card` component is highly reusable because:

1. It can display or hide a title based on whether the `title` prop is provided
2. It can render different styles based on the `variant` prop
3. It can contain any content through the `children` prop

## The Fourth Principle: Composition Patterns

Let's explore some common composition patterns in React that enhance reusability:

### 1. Containment with Children

The `children` prop is React's built-in way to compose components. It allows a component to accept and render arbitrary content.

```jsx
function Panel({ children }) {
  return (
    <div className="border rounded p-4 my-2">
      {children}
    </div>
  );
}

// Usage
function App() {
  return (
    <Panel>
      <h2>Hello World</h2>
      <p>This content is passed as children!</p>
    </Panel>
  );
}
```

### 2. Specialization through Props

We can create specialized versions of components by passing different props:

```jsx
function Button({ children, variant = "primary", size = "medium", ...props }) {
  const variantClasses = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-gray-800",
    danger: "bg-red-500 text-white"
  };
  
  const sizeClasses = {
    small: "py-1 px-2 text-sm",
    medium: "py-2 px-4",
    large: "py-3 px-6 text-lg"
  };
  
  return (
    <button 
      className={`rounded ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Create specialized buttons
function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

function SmallButton(props) {
  return <Button size="small" {...props} />;
}
```

### 3. Render Props Pattern

This pattern involves passing a function as a prop that tells the component what to render:

```jsx
function List({ items, renderItem }) {
  return (
    <ul className="list-disc pl-5">
      {items.map((item, index) => (
        <li key={index}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage
function App() {
  const fruits = ["Apple", "Banana", "Cherry"];
  
  return (
    <List 
      items={fruits}
      renderItem={(fruit) => (
        <span className="font-bold text-green-600">{fruit}</span>
      )}
    />
  );
}
```

### 4. Component Composition with Slots

Instead of just using `children`, we can create multiple "slots" for content:

```jsx
function Layout({ header, sidebar, content, footer }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        {header}
      </header>
    
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 p-4">
          {sidebar}
        </aside>
      
        <main className="flex-1 p-4">
          {content}
        </main>
      </div>
    
      <footer className="bg-gray-800 text-white p-4">
        {footer}
      </footer>
    </div>
  );
}

// Usage
function App() {
  return (
    <Layout
      header={<h1>My Application</h1>}
      sidebar={<nav>Navigation items here...</nav>}
      content={<article>Main content here...</article>}
      footer={<p>© 2025 My Company</p>}
    />
  );
}
```

## The Fifth Principle: Compound Components

> "Related components can be designed to work together while maintaining independence."

Compound components are a pattern where multiple components work together to form a cohesive experience, but can still be used independently if needed.

```jsx
// A compound component example: Form components
function Form({ children, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

Form.Group = function FormGroup({ label, children }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1">{label}</label>}
      {children}
    </div>
  );
};

Form.Input = function FormInput({ name, ...props }) {
  return (
    <input 
      name={name}
      className="border rounded p-2 w-full"
      {...props}
    />
  );
};

Form.Select = function FormSelect({ name, options, ...props }) {
  return (
    <select 
      name={name}
      className="border rounded p-2 w-full"
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

Form.Button = function FormButton({ children, ...props }) {
  return (
    <button 
      className="bg-blue-500 text-white py-2 px-4 rounded"
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
};

// Usage
function SignupForm() {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group label="Name">
        <Form.Input name="name" placeholder="Enter your name" />
      </Form.Group>
    
      <Form.Group label="Email">
        <Form.Input 
          name="email" 
          type="email"
          placeholder="Enter your email" 
        />
      </Form.Group>
    
      <Form.Group label="Role">
        <Form.Select 
          name="role"
          options={[
            { value: "developer", label: "Developer" },
            { value: "designer", label: "Designer" },
            { value: "manager", label: "Manager" }
          ]}
        />
      </Form.Group>
    
      <Form.Button>Sign Up</Form.Button>
    </Form>
  );
}
```

The beauty of this pattern is that the components are designed to work together seamlessly, but you could also use `Form.Input` by itself if needed.

## The Sixth Principle: Custom Hooks for Shared Logic

While not strictly about component composition, custom hooks are an essential tool for making React code reusable by extracting and sharing logic between components.

```jsx
// A custom hook for form handling
function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
  
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const validate = (validationRules) => {
    const newErrors = {};
    let isValid = true;
  
    Object.entries(validationRules).forEach(([field, rules]) => {
      if (rules.required && !values[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });
  
    setErrors(newErrors);
    return isValid;
  };
  
  return { values, handleChange, errors, validate };
}

// Usage in a component
function ContactForm() {
  const { values, handleChange, errors, validate } = useForm({
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const isValid = validate({
      name: { required: true },
      email: { required: true },
      message: { required: true }
    });
  
    if (isValid) {
      console.log('Form submitted:', values);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>
    
      {/* Other fields... */}
    
      <button type="submit">Submit</button>
    </form>
  );
}
```

By extracting form handling logic into a custom hook, we've made it reusable across many different form components.

## Practical Example: Building a Complex UI with Composition

Let's put these principles together in a more complex example - a dashboard card system:

```jsx
// Base components
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children }) {
  return <div className="mb-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }) {
  return (
    <div className="border-t pt-3 mt-2 text-sm text-gray-500">
      {children}
    </div>
  );
};

// Specialized card components
function MetricCard({ title, value, change, icon }) {
  // Determine if change is positive or negative
  const isPositive = change > 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const changeIcon = isPositive ? "↑" : "↓";
  
  return (
    <Card>
      <Card.Header 
        title={title}
        action={icon && <span className="text-blue-500 text-2xl">{icon}</span>}
      />
      <Card.Body>
        <div className="text-3xl font-bold">{value}</div>
        {change && (
          <div className={`mt-1 ${changeColor}`}>
            {changeIcon} {Math.abs(change)}%
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function ListCard({ title, items, onItemClick }) {
  return (
    <Card>
      <Card.Header title={title} />
      <Card.Body>
        <ul className="divide-y">
          {items.map((item, index) => (
            <li 
              key={index}
              className="py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => onItemClick(item)}
            >
              {item.title}
              {item.subtitle && (
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              )}
            </li>
          ))}
        </ul>
      </Card.Body>
      <Card.Footer>
        Showing {items.length} items
      </Card.Footer>
    </Card>
  );
}

// Usage in a dashboard
function Dashboard() {
  const salesData = {
    title: "Sales",
    value: "$12,543",
    change: 12.3,
    icon: "💰"
  };
  
  const userItems = [
    { title: "John Doe", subtitle: "Admin" },
    { title: "Jane Smith", subtitle: "User" },
    { title: "Bob Johnson", subtitle: "Editor" }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard {...salesData} />
    
      <ListCard
        title="Recent Users"
        items={userItems}
        onItemClick={(user) => console.log('User clicked:', user)}
      />
    
      {/* Custom card using base components */}
      <Card className="col-span-full">
        <Card.Header 
          title="Custom Card" 
          subtitle="Using base components"
          action={<button className="text-blue-500">Action</button>}
        />
        <Card.Body>
          <p>This card is built using the base Card components directly.</p>
          <p>It shows how flexible the composition system is.</p>
        </Card.Body>
        <Card.Footer>Updated 2 hours ago</Card.Footer>
      </Card>
    </div>
  );
}
```

This example demonstrates:

1. Base components (`Card` and its sub-components) that handle structure and styling
2. Specialized components (`MetricCard`, `ListCard`) built on top of base components
3. Direct use of base components for custom needs

## Common Pitfalls to Avoid

### 1. Prop Drilling

When components need to pass props through many levels, it becomes cumbersome:

```jsx
// Prop drilling - passing userData through multiple levels
function App() {
  const userData = { name: "John", role: "Admin" };
  return <Layout userData={userData} />;
}

function Layout({ userData }) {
  return (
    <div>
      <Header userData={userData} />
      <Content />
    </div>
  );
}

function Header({ userData }) {
  return (
    <header>
      <UserInfo userData={userData} />
    </header>
  );
}

function UserInfo({ userData }) {
  return <div>Welcome, {userData.name}!</div>;
}
```

**Solution:** Use React Context or state management libraries for data that needs to be accessed by many components.

```jsx
// Creating a context
const UserContext = React.createContext();

function App() {
  const userData = { name: "John", role: "Admin" };
  
  return (
    <UserContext.Provider value={userData}>
      <Layout />
    </UserContext.Provider>
  );
}

function Layout() {
  return (
    <div>
      <Header />
      <Content />
    </div>
  );
}

function Header() {
  return (
    <header>
      <UserInfo />
    </header>
  );
}

function UserInfo() {
  // Get data directly from context
  const userData = useContext(UserContext);
  return <div>Welcome, {userData.name}!</div>;
}
```

### 2. Overly Specific Components

Creating components that are too specific reduces reusability:

```jsx
// Too specific - hard to reuse
function BlueRoundedButtonWithIcon({ icon, text }) {
  return (
    <button className="bg-blue-500 text-white rounded-full p-2">
      <span className="mr-2">{icon}</span>
      {text}
    </button>
  );
}
```

**Solution:** Create more generic components with props for customization:

```jsx
// More generic and reusable
function Button({ 
  children,
  variant = "default",
  rounded = false,
  icon = null,
  ...props
}) {
  const variantClasses = {
    default: "bg-gray-200 text-gray-800",
    primary: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
  };
  
  const roundedClass = rounded ? "rounded-full" : "rounded";
  
  return (
    <button 
      className={`${variantClasses[variant]} ${roundedClass} p-2`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

// Usage
function App() {
  return (
    <div>
      <Button variant="primary" rounded icon="👍">
        Like
      </Button>
    </div>
  );
}
```

## Best Practices for Component Composition

1. **Design components with a single responsibility**
   * Each component should do one thing well
   * If a component grows too large, split it into smaller ones
2. **Make components configurable with props**
   * Use default values for props when appropriate
   * Pass event handlers through props rather than hardcoding them
3. **Use composition over inheritance**
   * Prefer containing components over extending them
   * Use the `children` prop for flexibility
4. **Keep state as local as possible**
   * Only lift state up when necessary
   * Use context for truly global state
5. **Write reusable components that solve common patterns**
   * Identify repeated UI patterns in your application
   * Extract those patterns into reusable components
6. **Document your components**
   * Document the props and their purpose
   * Provide usage examples
   * Consider using TypeScript or PropTypes for better type safety

## Conclusion

Component composition and reusability are at the heart of what makes React powerful. By building small, focused components that can be combined in various ways, we create UIs that are easier to maintain, test, and extend.

The key principles to remember are:

* Create small components with a single responsibility
* Use props to make components configurable
* Compose complex UIs from simple building blocks
* Extract shared logic into custom hooks
* Use established patterns like compound components when appropriate

By following these principles, you'll create a component library that's flexible, maintainable, and a joy to work with.
