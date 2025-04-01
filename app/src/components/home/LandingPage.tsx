import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Container, Box, Check, ChevronRight, ChevronDown } from "lucide-react";

const DockerLearningUI = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState([0]);

  const toggleSection = (index) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter((i) => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  const markAsCompleted = (index) => {
    if (!completedSections.includes(index)) {
      setCompletedSections([...completedSections, index]);
    }
    // Open the next section automatically
    if (index < sections.length - 1 && !expandedSections.includes(index + 1)) {
      setExpandedSections([...expandedSections, index + 1]);
    }
    setActiveSection(index + 1);
  };

  const sections = [
    {
      title: "1. Docker Fundamentals: Containers vs VMs",
      content: (
        <div className="space-y-4">
          <p className="text-foreground">
            Docker uses containerization, a lightweight alternative to virtual
            machines. Let's understand the key differences:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-card p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Virtual Machines</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Include full OS copy</li>
                <li>Slow to start (minutes)</li>
                <li>Resource heavy</li>
                <li>Complete isolation</li>
                <li>GB in size</li>
              </ul>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Docker Containers</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Share host OS kernel</li>
                <li>Start in seconds</li>
                <li>Lightweight</li>
                <li>Process-level isolation</li>
                <li>MB in size</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="border-l-2 border-primary pl-4 py-2">
              <p className="italic text-sm">
                At its core, Docker is about running processes in isolated
                environments with their own filesystem, networking, and process
                tree, but sharing the same kernel as the host.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2. Docker Architecture",
      content: (
        <div className="space-y-4">
          <p>
            Docker follows a client-server architecture with these main
            components:
          </p>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex border rounded-lg p-3">
              <div className="mr-4 text-primary">
                <Box size={24} />
              </div>
              <div>
                <h4 className="font-medium">Docker Client</h4>
                <p className="text-sm text-muted-foreground">
                  The CLI tool you interact with when running docker commands
                </p>
              </div>
            </div>

            <div className="flex border rounded-lg p-3">
              <div className="mr-4 text-primary">
                <Container size={24} />
              </div>
              <div>
                <h4 className="font-medium">Docker Daemon (dockerd)</h4>
                <p className="text-sm text-muted-foreground">
                  The background service that builds, runs, and manages
                  containers
                </p>
              </div>
            </div>

            <div className="flex border rounded-lg p-3">
              <div className="mr-4 text-primary">
                <Box size={24} />
              </div>
              <div>
                <h4 className="font-medium">Docker Registry</h4>
                <p className="text-sm text-muted-foreground">
                  Stores Docker images (Docker Hub is the public registry)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg mt-4">
            <h4 className="font-medium mb-2">Key Concepts:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>
                  <strong>Images:</strong> Read-only templates used to create
                  containers (like a class)
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>
                  <strong>Containers:</strong> Running instances of images (like
                  objects)
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>
                  <strong>Dockerfile:</strong> Text document with instructions
                  to build an image
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "3. Getting Started: Installation & First Commands",
      content: (
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg">
            <h4 className="font-medium mb-2">Installation</h4>
            <p className="mb-2">Docker Desktop is available for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Windows (requires WSL2 or Hyper-V)</li>
              <li>macOS (Intel and Apple Silicon)</li>
              <li>Linux (various distributions)</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Download from:{" "}
              <a href="#" className="text-primary">
                docker.com/get-started
              </a>
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Essential Commands</h4>

            <div className="space-y-3">
              <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
                <p>// Verify installation</p>
                <p className="text-primary-foreground">$ docker --version</p>
                <p>Docker version 25.0.3, build 4debf41</p>
              </div>

              <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
                <p>// Run your first container</p>
                <p className="text-primary-foreground">
                  $ docker run hello-world
                </p>
                <p>
                  Hello from Docker!
                  <br />
                  This message shows that your installation appears to be
                  working correctly...
                </p>
              </div>

              <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
                <p>// List running containers</p>
                <p className="text-primary-foreground">$ docker ps</p>
              </div>

              <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
                <p>// List all containers (including stopped)</p>
                <p className="text-primary-foreground">$ docker ps -a</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "5. Docker Compose: Multi-Container Applications",
      content: (
        <div className="space-y-4">
          <p>
            Docker Compose lets you define and run multi-container applications
            using a YAML file:
          </p>

          <div className="mt-4">
            <h4 className="font-medium mb-2">docker-compose.yml Example:</h4>
            <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
              <p className="text-primary-foreground">version: '3'</p>
              <p className="text-primary-foreground">services:</p>
              <p className="text-primary-foreground"> web:</p>
              <p className="text-primary-foreground"> build: .</p>
              <p className="text-primary-foreground"> ports:</p>
              <p className="text-primary-foreground"> - "3000:3000"</p>
              <p className="text-primary-foreground"> depends_on:</p>
              <p className="text-primary-foreground"> - db</p>
              <p className="text-primary-foreground"> environment:</p>
              <p className="text-primary-foreground">
                {" "}
                - DATABASE_URL=mongodb://db:27017/myapp
              </p>
              <p className="text-primary-foreground"> </p>
              <p className="text-primary-foreground"> db:</p>
              <p className="text-primary-foreground"> image: mongo:latest</p>
              <p className="text-primary-foreground"> volumes:</p>
              <p className="text-primary-foreground"> - mongo-data:/data/db</p>
              <p className="text-primary-foreground"> </p>
              <p className="text-primary-foreground">volumes:</p>
              <p className="text-primary-foreground"> mongo-data:</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Running with Docker Compose:</h4>
            <div className="bg-black/90 text-white p-3 rounded-md font-mono text-sm">
              <p>// Start all services</p>
              <p className="text-primary-foreground">$ docker-compose up</p>
              <p> </p>
              <p>// Start in detached mode</p>
              <p className="text-primary-foreground">$ docker-compose up -d</p>
              <p> </p>
              <p>// Stop all services</p>
              <p className="text-primary-foreground">$ docker-compose down</p>
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg mt-4">
            <h4 className="font-medium mb-2">Key Benefits:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>Defines entire application stack in one file</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>
                  Creates a custom network for containers to communicate
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>Manages volumes for persistent data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary mt-1">
                  <Check size={16} />
                </span>
                <span>Simplifies environment management</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-background">
      <h2 className="text-2xl font-bold mb-6">Docker from First Principles</h2>
      <p className="mb-8 text-muted-foreground">
        A comprehensive guide to understanding and using Docker, starting from
        the foundational concepts and building up to practical applications.
      </p>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={index}
            className={cn(
              "border rounded-lg overflow-hidden",
              activeSection === index ? "border-primary" : "border-border",
              completedSections.includes(index) ? "bg-primary/5" : ""
            )}
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection(index)}
            >
              <div className="flex items-center">
                {completedSections.includes(index) ? (
                  <div className="w-6 h-6 rounded-full bg-primary mr-3 flex items-center justify-center">
                    <Check size={16} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full mr-3 flex items-center justify-center",
                      activeSection === index ? "bg-primary/20" : "bg-secondary"
                    )}
                  >
                    <span className="text-sm">{index + 1}</span>
                  </div>
                )}
                <h3 className="font-medium">{section.title}</h3>
              </div>
              {expandedSections.includes(index) ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </div>

            {expandedSections.includes(index) && (
              <div className="p-4 border-t">
                {section.content}

                <div className="mt-6 flex justify-end">
                  {index < sections.length - 1 ? (
                    <button
                      onClick={() => markAsCompleted(index)}
                      className={cn(
                        "px-4 py-2 rounded-md flex items-center",
                        completedSections.includes(index)
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {completedSections.includes(index)
                        ? "Completed"
                        : "Mark as Completed"}
                      {!completedSections.includes(index) && (
                        <ChevronRight size={16} className="ml-1" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsCompleted(index)}
                      className={cn(
                        "px-4 py-2 rounded-md",
                        completedSections.includes(index)
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {completedSections.includes(index)
                        ? "Course Completed!"
                        : "Finish Course"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-card rounded-lg">
        <h3 className="font-medium mb-2">Your Progress</h3>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{
              width: `${(completedSections.length / sections.length) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-sm mt-2 text-right text-muted-foreground">
          {completedSections.length} of {sections.length} sections completed
        </p>
      </div>
    </div>
  );
};

export default DockerLearningUI;
