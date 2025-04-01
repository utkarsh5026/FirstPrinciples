// src/data/sampleDocument.ts

import { Document } from "@/components/core/type";

// Sample document with various block types
export const sampleDocument: Document = {
  id: "1",
  title: "Getting Started with React",
  createdAt: "2025-03-28T12:00:00Z",
  updatedAt: "2025-04-01T09:30:00Z",
  blocks: [
    {
      id: "block-1",
      type: "paragraph",
      content:
        "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and efficiently update the DOM when data changes.",
    },
    {
      id: "block-2",
      type: "heading-2",
      content: "Key Concepts",
    },
    {
      id: "block-3",
      type: "bulleted-list",
      items: [
        {
          id: "item-1",
          content: "Components: Reusable, self-contained pieces of UI",
        },
        {
          id: "item-2",
          content: "Props: How data is passed from parent to child components",
        },
        {
          id: "item-3",
          content: "State: How components manage and respond to data changes",
        },
        {
          id: "item-4",
          content: "Virtual DOM: An efficient way to update the real DOM",
        },
      ],
    },
    {
      id: "block-4",
      type: "heading-2",
      content: "Getting Started",
    },
    {
      id: "block-5",
      type: "paragraph",
      content:
        "To start using React, you can create a new project using Create React App or Vite. Here's an example of a simple React component:",
    },
    {
      id: "block-6",
      type: "code",
      content: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
      language: "jsx",
    },
    {
      id: "block-7",
      type: "heading-2",
      content: "React Hooks",
    },
    {
      id: "block-8",
      type: "paragraph",
      content:
        'Hooks are functions that let you "hook into" React state and lifecycle features from function components.',
    },
    {
      id: "block-9",
      type: "heading-3",
      content: "Common Hooks",
    },
    {
      id: "block-10",
      type: "numbered-list",
      items: [
        {
          id: "hook-1",
          content: "useState: Manage state in function components",
        },
        {
          id: "hook-2",
          content: "useEffect: Perform side effects in function components",
        },
        {
          id: "hook-3",
          content: "useContext: Access context in function components",
        },
        { id: "hook-4", content: "useRef: Create mutable ref objects" },
      ],
    },
    {
      id: "block-11",
      type: "quote",
      content:
        "Hooks are the future of React development. They allow for more reusable and composable code patterns.",
    },
    {
      id: "block-12",
      type: "divider",
    },
    {
      id: "block-13",
      type: "heading-2",
      content: "React Ecosystem",
    },
    {
      id: "block-14",
      type: "paragraph",
      content:
        "React has a rich ecosystem of libraries and tools that help with various aspects of application development.",
    },
    {
      id: "block-15",
      type: "image",
      url: "/api/placeholder/800/400",
      caption:
        "The React ecosystem includes state management, routing, styling, and more.",
    },
    {
      id: "block-16",
      type: "paragraph",
      content:
        "Some popular libraries in the React ecosystem include Redux, React Router, Styled Components, and Next.js.",
    },
  ],
};
