# Authorization Strategies in React Production-Ready Applications

> Authorization is at the heart of secure application development. It's not just about keeping unauthorized users out—it's about creating a tailored experience for each user based on what they're allowed to do within your system.

## Understanding Authorization from First Principles

### What is Authorization?

Authorization is the process of determining whether a user has permission to access a resource or perform an action. It's fundamentally different from authentication:

> Authentication answers the question: "Who are you?"
>
> Authorization answers the question: "What are you allowed to do?"

To understand authorization from first principles, we need to think about how we control access in the physical world:

Imagine a hotel:

* Everyone can enter the lobby (public access)
* Only guests with key cards can access rooms (authenticated access)
* Only guests with specific key cards can access their assigned room (basic authorization)
* Only certain staff members can access maintenance areas (role-based authorization)
* Only during specific time windows can cleaning staff access guest rooms (conditional authorization)

In web applications, we implement these same patterns digitally.

### Core Authorization Models

Before diving into React-specific implementations, let's understand the fundamental models of authorization:

1. **Discretionary Access Control (DAC)** : Resource owners decide who can access their resources
2. **Mandatory Access Control (MAC)** : System-wide policies determine access based on predefined security labels
3. **Role-Based Access Control (RBAC)** : Access decisions based on the roles assigned to users
4. **Attribute-Based Access Control (ABAC)** : Access decisions based on attributes of users, resources, actions, and environment
5. **Policy-Based Access Control (PBAC)** : Access decisions based on policies defined in a centralized policy engine

Let's examine a simple RBAC example:

```javascript
// Basic role definition
const roles = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// Permissions for each role
const rolePermissions = {
  [roles.ADMIN]: ['read', 'write', 'delete', 'manage_users'],
  [roles.EDITOR]: ['read', 'write'],
  [roles.VIEWER]: ['read']
};

// Check if user has permission
function hasPermission(userRole, requiredPermission) {
  // Get permissions for the user's role
  const permissions = rolePermissions[userRole] || [];
  
  // Check if the required permission is in the user's permissions
  return permissions.includes(requiredPermission);
}

// Example usage
const userRole = roles.EDITOR;
console.log(hasPermission(userRole, 'read'));  // true
console.log(hasPermission(userRole, 'delete')); // false
```

This simple example demonstrates how we can check if a user with a certain role has a specific permission. Let's now explore how to apply these principles in React applications.

## Authorization in React Applications

React itself doesn't provide specific authorization mechanisms—it's a UI library. However, its component architecture makes it an excellent platform for implementing various authorization strategies.

### The Challenge of Client-Side Authorization

> Important: Client-side authorization is never enough on its own. Always enforce authorization on the server side.

Client-side authorization has two primary purposes:

1. Preventing unauthorized UI rendering (hiding buttons, pages, or features)
2. Enhancing user experience by not allowing attempts at unauthorized actions

Let's explore the different strategies for implementing authorization in React applications.

### 1. JWT-Based Authorization

JSON Web Tokens (JWT) are compact, self-contained tokens that can securely transmit information between parties.

#### How JWT Authorization Works:

1. User authenticates and receives a JWT containing claims (including roles/permissions)
2. The token is stored (typically in memory, localStorage, or an HttpOnly cookie)
3. The token is sent with each API request
4. The client can decode (but not verify) the token to make UI authorization decisions

Let's implement a simple JWT authorization system:

```jsx
// auth.js - Authentication utilities
import jwtDecode from 'jwt-decode';

// Get the token from storage
export function getToken() {
  return localStorage.getItem('token');
}

// Decode and extract user information
export function getUser() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode the token to extract user information
    const decoded = jwtDecode(token);
  
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      // Token expired, clear it
      localStorage.removeItem('token');
      return null;
    }
  
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

// Check if user has a specific permission
export function hasPermission(permission) {
  const user = getUser();
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes(permission);
}

// Check if user has a specific role
export function hasRole(role) {
  const user = getUser();
  if (!user || !user.roles) return false;
  
  return user.roles.includes(role);
}
```

Now we can use these functions to make authorization decisions in our components:

```jsx
// AdminDashboard.jsx
import React from 'react';
import { hasRole } from './auth';
import { Navigate } from 'react-router-dom';

function AdminDashboard() {
  // Check if user has admin role
  if (!hasRole('admin')) {
    // Redirect to unauthorized page if not admin
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {/* Admin-only content */}
    </div>
  );
}

export default AdminDashboard;
```

### 2. Route-Based Authorization with React Router

A common approach is to protect routes based on user permissions:

```jsx
// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasPermission } from './auth';

function ProtectedRoute({ requiredPermission }) {
  // Check if user has the required permission
  const isAuthorized = hasPermission(requiredPermission);
  
  // If not authorized, redirect to login or unauthorized page
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authorized, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
```

Then we can use this component in our router configuration:

```jsx
// AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import AdminPanel from './AdminPanel';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from './UnauthorizedPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<HomePage />} />
      
        {/* Protected routes for authenticated users */}
        <Route element={<ProtectedRoute requiredPermission="view_dashboard" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      
        {/* Protected routes for admins */}
        <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      
        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
```

### 3. Context-Based Authorization

Using React Context, we can provide authorization capabilities throughout our application without prop drilling:

```jsx
// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
      
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);
  
  // Login function
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser(decoded);
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };
  
  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

Now we can use this context throughout our application:

```jsx
// App.jsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import AppRouter from './AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
```

And in our components:

```jsx
// UserProfile.jsx
import React from 'react';
import { useAuth } from './AuthContext';

function UserProfile() {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <p>Please log in to view your profile</p>;
  }
  
  return (
    <div className="user-profile">
      <h1>Welcome, {user.name}</h1>
    
      <div className="profile-details">
        <p>Email: {user.email}</p>
        {/* Only show if user has permission */}
        {hasPermission('view_billing') && (
          <div className="billing-info">
            <h2>Billing Information</h2>
            {/* Billing content */}
          </div>
        )}
      </div>
    
      {/* Conditional rendering based on permissions */}
      {hasPermission('edit_profile') ? (
        <button className="edit-button">Edit Profile</button>
      ) : null}
    </div>
  );
}

export default UserProfile;
```

### 4. Component-Level Authorization (Higher-Order Components)

We can create a Higher-Order Component (HOC) to wrap components that require authorization:

```jsx
// withAuthorization.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import UnauthorizedPage from './UnauthorizedPage';

// HOC that checks if user has required permission
export function withAuthorization(requiredPermission) {
  return function(WrappedComponent) {
    return function WithAuthorization(props) {
      const { hasPermission, loading } = useAuth();
    
      // Show loading state
      if (loading) {
        return <div>Loading...</div>;
      }
    
      // Check if user has permission
      if (!hasPermission(requiredPermission)) {
        return <UnauthorizedPage />;
      }
    
      // Render original component if authorized
      return <WrappedComponent {...props} />;
    };
  };
}
```

Using the HOC:

```jsx
// SettingsPage.jsx
import React from 'react';
import { withAuthorization } from './withAuthorization';

function SettingsPage() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      {/* Settings content */}
    </div>
  );
}

// Export with authorization check
export default withAuthorization('manage_settings')(SettingsPage);
```

### 5. Hook-Based Authorization

Custom hooks provide a more modern and flexible approach:

```jsx
// useAuthorization.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function useAuthorization(requiredPermission) {
  const { hasPermission, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only check after loading is complete
    if (!loading && !hasPermission(requiredPermission)) {
      navigate('/unauthorized', { replace: true });
    }
  }, [hasPermission, loading, navigate, requiredPermission]);
  
  return { isAuthorized: hasPermission(requiredPermission), loading };
}
```

Using the hook:

```jsx
// ReportsPage.jsx
import React from 'react';
import { useAuthorization } from './useAuthorization';

function ReportsPage() {
  const { isAuthorized, loading } = useAuthorization('view_reports');
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Component will redirect if not authorized
  return (
    <div className="reports">
      <h1>Reports</h1>
      {/* Reports content */}
    </div>
  );
}

export default ReportsPage;
```

### 6. Permission-Based UI Components

Creating reusable permission components can lead to cleaner code:

```jsx
// Authorized.jsx
import React from 'react';
import { useAuth } from './AuthContext';

// Component that renders children only if user has permission
export function Authorized({ permission, fallback = null, children }) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
}

// Component that renders children only if user has role
export function AuthorizedRole({ role, fallback = null, children }) {
  const { hasRole } = useAuth();
  
  if (!hasRole(role)) {
    return fallback;
  }
  
  return children;
}
```

Using these components:

```jsx
// Dashboard.jsx
import React from 'react';
import { Authorized, AuthorizedRole } from './Authorized';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
    
      {/* Regular content visible to all dashboard users */}
      <div className="stats">
        <h2>Statistics</h2>
        {/* Stats content */}
      </div>
    
      {/* Only visible to users with 'view_reports' permission */}
      <Authorized permission="view_reports">
        <div className="reports-section">
          <h2>Reports</h2>
          {/* Reports content */}
        </div>
      </Authorized>
    
      {/* Only visible to admin users */}
      <AuthorizedRole 
        role="admin" 
        fallback={<p>Contact your administrator for system settings</p>}
      >
        <div className="admin-section">
          <h2>System Settings</h2>
          {/* Admin settings */}
        </div>
      </AuthorizedRole>
    </div>
  );
}

export default Dashboard;
```

## Advanced Authorization Strategies for Production

### 1. Policy-Based Authorization

For complex authorization rules, a policy-based approach is more maintainable:

```jsx
// policies.js - Centralized policy definitions
const policies = {
  // Check if user can edit a post
  canEditPost: (user, post) => {
    // Author can edit their own post
    if (post.authorId === user.id) return true;
  
    // Editors can edit any post
    if (user.roles.includes('editor')) return true;
  
    // Admins can do anything
    if (user.roles.includes('admin')) return true;
  
    return false;
  },
  
  // Check if user can delete a post
  canDeletePost: (user, post) => {
    // Author can delete their own post if it's less than 24 hours old
    if (post.authorId === user.id) {
      const postAge = Date.now() - new Date(post.createdAt).getTime();
      const hoursOld = postAge / (1000 * 60 * 60);
    
      if (hoursOld < 24) return true;
    }
  
    // Admins can delete any post
    if (user.roles.includes('admin')) return true;
  
    return false;
  }
};

export default policies;
```

Using policies in components:

```jsx
// PostActions.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import policies from './policies';

function PostActions({ post }) {
  const { user } = useAuth();
  
  // If no user, show nothing
  if (!user) return null;
  
  // Check permissions using policies
  const canEdit = policies.canEditPost(user, post);
  const canDelete = policies.canDeletePost(user, post);
  
  return (
    <div className="post-actions">
      {canEdit && (
        <button className="edit-button">Edit Post</button>
      )}
    
      {canDelete && (
        <button className="delete-button">Delete Post</button>
      )}
    </div>
  );
}

export default PostActions;
```

### 2. Feature Flags with Authorization

Combining feature flags with authorization allows for gradual rollouts:

```jsx
// featureFlags.js
const features = {
  NEW_DASHBOARD: {
    enabled: true,
    // Roles that can access this feature
    roles: ['admin', 'beta_tester'],
    // Percentage of regular users who should see this feature
    percentage: 20
  },
  ADVANCED_ANALYTICS: {
    enabled: true,
    // Only available for premium users
    permissions: ['premium_features']
  }
};

// Check if feature is enabled for user
export function isFeatureEnabled(featureKey, user) {
  const feature = features[featureKey];
  
  // Feature not found or disabled
  if (!feature || !feature.enabled) return false;
  
  // Check role-based access
  if (feature.roles && user.roles) {
    for (const role of feature.roles) {
      if (user.roles.includes(role)) return true;
    }
  }
  
  // Check permission-based access
  if (feature.permissions && user.permissions) {
    for (const permission of feature.permissions) {
      if (user.permissions.includes(permission)) return true;
    }
  }
  
  // Check percentage-based rollout using user ID for consistency
  if (feature.percentage) {
    // Generate a number between 0-100 based on user ID
    const hash = hashString(user.id);
    const userNumber = hash % 100;
  
    // If user's number is within the percentage, enable the feature
    if (userNumber < feature.percentage) return true;
  }
  
  return false;
}

// Simple string hash function
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
```

Using feature flags with authorization:

```jsx
// Dashboard.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import { isFeatureEnabled } from './featureFlags';
import ClassicDashboard from './ClassicDashboard';
import NewDashboard from './NewDashboard';

function Dashboard() {
  const { user } = useAuth();
  
  // Check if new dashboard feature is enabled for the user
  const showNewDashboard = isFeatureEnabled('NEW_DASHBOARD', user);
  
  return (
    <div>
      {showNewDashboard ? <NewDashboard /> : <ClassicDashboard />}
    </div>
  );
}

export default Dashboard;
```

## Production Security Considerations

### 1. Never Trust the Client

> Always remember: Client-side authorization is for UI purposes only. All authorization decisions must be validated on the server.

```jsx
// Example of client-side and server-side validation
function deletePost(postId) {
  // Client-side check (for UI purposes)
  if (!hasPermission('delete_posts')) {
    return showError('You do not have permission to delete posts');
  }
  
  // Always validate on the server too
  return api.deletePost(postId)
    .then(response => {
      // Success - post deleted
      showSuccess('Post deleted successfully');
    })
    .catch(error => {
      // Server rejected the action (e.g., unauthorized)
      handleApiError(error);
    });
}
```

### 2. Secure Token Storage

Storing authentication tokens securely is crucial:

```jsx
// auth.js - Secure token management
export function storeToken(token) {
  // Option 1: HttpOnly cookies (most secure, requires server config)
  // This is handled by the server setting the cookie
  
  // Option 2: Memory storage (lost on page refresh)
  // Store in a variable, not persisted
  sessionToken = token;
  
  // Option 3: localStorage with expiration check
  // Less secure but convenient
  const tokenData = {
    value: token,
    expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  };
  localStorage.setItem('auth_token', JSON.stringify(tokenData));
}

export function getToken() {
  // Memory storage option
  if (sessionToken) return sessionToken;
  
  // localStorage option with expiration check
  const tokenData = JSON.parse(localStorage.getItem('auth_token'));
  if (!tokenData) return null;
  
  // Check if token is expired
  if (tokenData.expires < Date.now()) {
    localStorage.removeItem('auth_token');
    return null;
  }
  
  return tokenData.value;
}
```

### 3. Regular Permission Refreshing

Permissions can change server-side, so periodically refresh them:

```jsx
// AuthProvider.jsx (partial)
function AuthProvider({ children }) {
  // ...existing code
  
  // Refresh user permissions periodically
  useEffect(() => {
    if (!user) return;
  
    // Refresh permissions every 15 minutes
    const intervalId = setInterval(() => {
      api.getUserPermissions()
        .then(response => {
          // Update user with fresh permissions
          setUser(prev => ({ ...prev, permissions: response.permissions }));
        })
        .catch(error => {
          console.error('Failed to refresh permissions:', error);
        });
    }, 15 * 60 * 1000);
  
    return () => clearInterval(intervalId);
  }, [user]);
  
  // ...rest of the component
}
```

### 4. Managing Authentication State During Token Expiration

Handle token expiration gracefully:

```jsx
// api.js - Axios interceptor for handling expired tokens
import axios from 'axios';
import { getToken, refreshToken, logout } from './auth';

const api = axios.create({
  baseURL: '/api'
});

// Add authorization header to all requests
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
  
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
    
      try {
        // Attempt to refresh the token
        const newToken = await refreshToken();
      
        // If successful, update the header and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        logout();
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
  
    return Promise.reject(error);
  }
);

export default api;
```

## Testing Authorization Logic

Testing authorization is crucial for security:

```jsx
// auth.test.js
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock component to test Auth hook
function TestComponent({ testPermission }) {
  const { hasPermission } = useAuth();
  return (
    <div>
      {hasPermission(testPermission) ? 'Authorized' : 'Unauthorized'}
    </div>
  );
}

// Test suite
describe('Authorization', () => {
  test('should grant access with correct permissions', () => {
    // Mock local storage
    const mockUser = {
      id: '123',
      name: 'Test User',
      permissions: ['read', 'write']
    };
  
    localStorage.setItem('user', JSON.stringify(mockUser));
  
    // Render component with auth
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent testPermission="read" />
        </AuthProvider>
      </MemoryRouter>
    );
  
    // Check that access is granted
    expect(screen.getByText('Authorized')).toBeInTheDocument();
  
    // Clean up
    localStorage.removeItem('user');
  });
  
  test('should deny access with incorrect permissions', () => {
    // Mock user without required permission
    const mockUser = {
      id: '123',
      name: 'Test User',
      permissions: ['read']
    };
  
    localStorage.setItem('user', JSON.stringify(mockUser));
  
    // Render component with auth
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent testPermission="admin" />
        </AuthProvider>
      </MemoryRouter>
    );
  
    // Check that access is denied
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  
    // Clean up
    localStorage.removeItem('user');
  });
});
```

## Putting It All Together: A Complete Authorization System

Let's implement a complete RBAC system with React:

```jsx
// AuthContext.jsx - Complete implementation
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { jwtDecode } from 'jwt-decode';

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state
  useEffect(() => {
    async function initializeAuth() {
      try {
        // Check for token in storage
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
      
        // Decode token to check expiration
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp && decoded.exp < Date.now() / 1000;
      
        if (isExpired) {
          // Try to refresh token if expired
          try {
            await refreshUserSession();
          } catch (refreshError) {
            // If refresh fails, clear auth state
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
          }
        } else {
          // If token valid, get fresh user data
          const userData = await api.get('/user/me');
          setUser(userData.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    }
  
    initializeAuth();
  }, []);
  
  // Refresh user session
  async function refreshUserSession() {
    try {
      const response = await api.post('/auth/refresh');
      const { token, user } = response.data;
    
      // Store new token
      localStorage.setItem('token', token);
    
      // Update user state
      setUser(user);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  // Login function
  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
    
      // Store token
      localStorage.setItem('token', token);
    
      // Update state
      setUser(user);
      setError(null);
    
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  }
  
  // Logout function
  async function logout() {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of server response
      localStorage.removeItem('token');
      setUser(null);
    }
  }
  
  // Check if user has permission
  function hasPermission(permission) {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }
  
  // Check if user has role
  function hasRole(role) {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }
  
  // Check multiple permissions (requires all)
  function hasPermissions(permissions) {
    if (!Array.isArray(permissions) || !user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  }
  
  // Check multiple roles (requires any)
  function hasAnyRole(roles) {
    if (!Array.isArray(roles) || !user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUserSession,
    hasPermission,
    hasRole,
    hasPermissions,
    hasAnyRole,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Conclusion

> Authorization in React applications involves multiple interconnected layers that work together to create a secure, user-friendly experience.

From first principles, we've explored how authorization works and how to implement various strategies in React applications:

1. JWT-based authorization for token management
2. Route-based authorization for protecting navigation
3. Context-based solutions for application-wide state
4. Component-level authorization with HOCs
5. Hook-based approaches for functional components
6. Policy-based systems for complex rules

Remember these key principles:

1. Client-side authorization improves UX but must be backed by server-side validation
2. Choose the right authorization model for your application's needs
3. Keep authorization logic centralized and reusable
4. Regularly refresh permissions to ensure they're current
5. Test your authorization logic thoroughly

By following these strategies and principles, you can build a secure, maintainable authorization system for your production React applications.
