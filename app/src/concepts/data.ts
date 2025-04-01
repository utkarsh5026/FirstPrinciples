// src/concepts/data.ts
import { Document } from "@/components/core/type";

export const sampleDocument: Document = {
  id: "doc-001",
  title: "Understanding Modern Web Development",
  createdAt: "2025-03-15T12:00:00Z",
  updatedAt: "2025-03-28T14:30:00Z",
  blocks: [
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "This document explores modern web development concepts, particularly focusing on React, TypeScript, and Tailwind CSS - the trinity of modern frontend development.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-1",
      content: "React: A Component-Based Library",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage the state of these components efficiently.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-2",
      content: "React Hooks",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "Hooks were introduced in React 16.8 to allow function components to use state and other React features without writing a class.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "code",
      content:
        "function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}",
      language: "jsx",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-2",
      content: "React 19 Features",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "React 19 introduces several new features including improved server components, streaming SSR enhancements, and better error handling.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-1",
      content: "TypeScript: Type Safety for JavaScript",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "TypeScript adds static typing to JavaScript, helping developers catch errors early in the development process and providing better tooling support.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "quote",
      content:
        "TypeScript is JavaScript with syntax for types. - TypeScript documentation",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-2",
      content: "Benefits of TypeScript",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "bulleted-list",
      items: [
        {
          id: "", // We'll let DocumentProcessor assign this
          content: "Early error detection",
        },
        {
          id: "", // We'll let DocumentProcessor assign this
          content: "Improved IDE support with better autocompletion",
        },
        {
          id: "", // We'll let DocumentProcessor assign this
          content: "Safer refactoring",
        },
        {
          id: "", // We'll let DocumentProcessor assign this
          content: "Better documentation of code through type annotations",
        },
      ],
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-1",
      content: "Tailwind CSS: Utility-First CSS Framework",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "Tailwind CSS is a utility-first CSS framework that allows developers to rapidly build custom designs without leaving the HTML.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-2",
      content: "Tailwind 4 New Features",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "Tailwind 4 brings substantial performance improvements, native dark mode support, expanded color palette, and enhanced customization options.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "code",
      content:
        '<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n  Click me\n</button>',
      language: "jsx",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-2",
      content: "Using Tailwind with React",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "Tailwind works exceptionally well with React, allowing developers to style components directly in JSX without switching between files.",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "divider",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "heading-1",
      content: "Conclusion",
    },
    {
      id: "", // We'll let DocumentProcessor assign this
      type: "paragraph",
      content:
        "The combination of React, TypeScript, and Tailwind CSS provides a powerful stack for modern web development, offering a blend of component-based architecture, type safety, and utility-first styling.",
    },
  ],
};
