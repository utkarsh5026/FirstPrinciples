import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Code,
  Layers,
  BookOpen,
  Database,
  Package,
  Github,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const topics = [
  {
    icon: <Code className="h-6 w-6" />,
    title: "Python Fundamentals",
    description:
      "Understand Python from its core principles and data structures to advanced features.",
    topics: [
      "Variables & Types",
      "Control Flow",
      "Functions",
      "Data Structures",
      "OOP",
    ],
    color: "#10B981", // Green
    gradientFrom: "from-[#10B981]/20",
    gradientTo: "to-[#10B981]/5",
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: "TypeScript & JavaScript",
    description:
      "Learn how these languages work under the hood and why TypeScript builds on JavaScript.",
    topics: [
      "Type Systems",
      "Functional Programming",
      "Asynchronous Code",
      "DOM Manipulation",
    ],
    color: "#6366F1", // Purple
    gradientFrom: "from-[#6366F1]/20",
    gradientTo: "to-[#6366F1]/5",
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: "React Framework",
    description:
      "Understand React's component model and state management from first principles.",
    topics: [
      "Component Architecture",
      "Hooks",
      "State Management",
      "Virtual DOM",
    ],
    color: "#38BDF8", // Sky blue
    gradientFrom: "from-[#38BDF8]/20",
    gradientTo: "to-[#38BDF8]/5",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Docker & Containers",
    description:
      "Learn containerization concepts and how Docker implements them.",
    topics: [
      "Container Basics",
      "Images & Layers",
      "Networking",
      "Docker Compose",
    ],
    color: "#EC4899", // Pink
    gradientFrom: "from-[#EC4899]/20",
    gradientTo: "to-[#EC4899]/5",
  },
  {
    icon: <Github className="h-6 w-6" />,
    title: "Version Control",
    description:
      "Understand Git's internal data model and operations beyond just memorizing commands.",
    topics: [
      "Git Objects",
      "Branches & Merging",
      "Remote Repositories",
      "Workflow Strategies",
    ],
    color: "#F59E0B", // Amber
    gradientFrom: "from-[#F59E0B]/20",
    gradientTo: "to-[#F59E0B]/5",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Computer Science",
    description:
      "Grasp the theoretical foundations that make all programming possible.",
    topics: [
      "Algorithms",
      "Data Structures",
      "Computational Thinking",
      "Big O Notation",
    ],
    color: "#14B8A6", // Teal
    gradientFrom: "from-[#14B8A6]/20",
    gradientTo: "to-[#14B8A6]/5",
  },
];

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrolling, setIsScrolling] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track scrolling for animation effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 50);

      // Determine active section based on scroll position
      const sections = [
        "hero",
        "features",
        "topics",
        "philosophy",
        "get-started",
      ];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-gray-100 flex flex-col font-type-mono p-8"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-[#6366F1]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[#EC4899]/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-[#14B8A6]/5 blur-[150px] rounded-full"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djI2aDI0VjM0aC0yNHpNNiA2djI0aDI0VjZINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      </div>

      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 w-full transition-all duration-300 z-50 py-4 px-8",
          isScrolling
            ? "bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/10 py-2"
            : "bg-transparent "
        )}
      >
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full blur-sm opacity-70"></div>
              <div className="relative bg-[#1E293B] rounded-full p-1">
                <Code className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]">
              CodeFirst
            </span>
          </div>

          <nav className="hidden md:flex space-x-8">
            {["About", "Features", "Topics", "Philosophy"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  activeSection === item.toLowerCase().replace(" ", "-")
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {item}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#EC4899] transition-all duration-300 group-hover:w-full",
                    activeSection === item.toLowerCase().replace(" ", "-")
                      ? "w-full"
                      : ""
                  )}
                ></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <a href="#get-started" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-md blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative px-4 py-2 bg-[#1E293B] rounded-md text-sm font-medium border border-white/10 flex items-center space-x-2">
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 relative">
              {/* Decorative code lines */}
              <div className="absolute -left-16 top-0 bottom-0 border-l border-white/10 hidden md:block">
                <div className="absolute left-0 top-8 w-2 h-2 bg-[#6366F1] rounded-full transform -translate-x-1/2"></div>
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-[#EC4899] rounded-full transform -translate-x-1/2"></div>
                <div className="absolute left-0 bottom-8 w-2 h-2 bg-[#14B8A6] rounded-full transform -translate-x-1/2"></div>
              </div>

              <div className="inline-block">
                <div className="bg-[#1E293B] border border-white/10 rounded-full px-4 py-1 text-sm font-medium text-gray-300 flex items-center space-x-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
                  <span>First principles approach to programming</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Master Coding From <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]">
                  First Principles
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-md">
                Understand the fundamental concepts and building blocks that
                power every language and technology in the programming world.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="#get-started" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-6 py-3 bg-[#1E293B] rounded-md text-md font-medium border border-white/10 flex items-center justify-center space-x-2">
                    <span>Begin Your Journey</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </a>

                <a
                  href="#topics"
                  className="px-6 py-3 bg-[#1E293B]/80 hover:bg-[#1E293B] border border-white/10 rounded-md text-md font-medium transition-colors text-center flex items-center justify-center space-x-2"
                >
                  <span>Explore Topics</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Code line numbers decoration */}
              <div className="hidden md:flex flex-col items-end absolute -left-10 top-1/4 text-xs text-gray-500 font-mono space-y-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>
            </div>

            {/* Code snippet display component */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1]/20 to-[#EC4899]/20 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0F172A] rounded-lg overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(8,8,8,0.7)]">
                <div className="bg-[#1E293B] px-4 py-2 border-b border-white/10 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-4 text-sm font-mono text-gray-400 flex items-center">
                    <span className="text-[#6366F1] mr-1">~</span>
                    /first_principles.py
                  </div>
                </div>
                <pre
                  className="p-4 text-sm font-mono overflow-x-auto bg-[#0F172A]/80"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <code className="language-python text-left">
                    <div className="text-[#6366F1]">
                      def{" "}
                      <span className="text-[#10B981]">
                        understand_from_first_principles
                      </span>
                      (concept):
                    </div>
                    <div className="pl-4 text-gray-500">
                      # Break down complex ideas into fundamental parts
                    </div>
                    <div className="pl-4 text-gray-300">
                      fundamental_components = decompose(concept)
                    </div>
                    <div className="pl-4 text-gray-300">
                      clear_understanding = []
                    </div>
                    <div className="pl-4 text-gray-300"></div>
                    <div className="pl-4 text-[#6366F1]">for</div>
                    <div className="pl-4 text-gray-300">
                      {" "}
                      component in fundamental_components:
                    </div>
                    <div className="pl-8 text-gray-500">
                      # Build knowledge from the ground up
                    </div>
                    <div className="pl-8 text-gray-300">
                      insights = explore_deeply(component)
                    </div>
                    <div className="pl-8 text-gray-300">
                      clear_understanding.append(insights)
                    </div>
                    <div className="pl-4 text-gray-300"></div>
                    <div className="pl-4 text-[#6366F1]">return</div>
                    <div className="pl-4 text-gray-300">
                      {" "}
                      reconstruct(clear_understanding)
                    </div>
                  </code>
                </pre>
                {/* Terminal cursor blinking effect */}
                <div className="h-4 w-2 bg-gray-300 opacity-75 animate-pulse absolute bottom-4 left-[196px]"></div>

                {/* Glowing dots */}
                <div className="absolute h-1 w-1 rounded-full bg-[#6366F1] top-[30%] right-[10%] animate-pulse"></div>
                <div className="absolute h-1 w-1 rounded-full bg-[#EC4899] bottom-[20%] right-[30%] animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative tech words */}
        <div className="absolute bottom-5 left-0 right-0 overflow-hidden text-white/5 whitespace-nowrap text-9xl font-bold hidden md:block">
          PYTHON TYPESCRIPT REACT DOCKER GIT
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="relative py-20">
        <div className="absolute inset-0 bg-[#1E293B]/30 backdrop-blur-sm -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <div className="inline-block mb-3">
              <div className="bg-[#1E293B] border border-white/10 rounded-full px-4 py-1 text-sm font-medium text-gray-300">
                Why it works
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Why Learn From First Principles?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Instead of memorizing syntax or following tutorials blindly, build
              a deep understanding that transfers across all technologies.
            </p>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-[#6366F1] to-[#EC4899]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers className="h-8 w-8" />,
                title: "Deep Understanding",
                description:
                  "Learn the why behind every concept, not just the how. Build mental models that last throughout your career.",
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Language Agnostic",
                description:
                  "Master programming fundamentals that apply across Python, JavaScript, TypeScript, and beyond.",
              },
              {
                icon: <Terminal className="h-8 w-8" />,
                title: "Practical Projects",
                description:
                  "Apply first principles through hands-on projects that consolidate your knowledge.",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366F1]/20 to-[#EC4899]/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#1E293B] p-6 rounded-lg border border-white/10 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] transition-shadow h-full flex flex-col">
                  <div className="text-gradient-to-r text-[#6366F1] bg-clip-text mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-[#6366F1]/10 blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1E293B]/20 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <div className="inline-block mb-3">
              <div className="bg-[#1E293B] border border-white/10 rounded-full px-4 py-1 text-sm font-medium text-gray-300">
                Comprehensive curriculum
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Topics We Cover
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              From fundamental computing concepts to advanced frameworks, we
              break everything down to its essence.
            </p>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-[#6366F1] to-[#EC4899]"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <div key={topic.title} className="group relative">
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${topic.gradientFrom} ${topic.gradientTo} rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-300`}
                ></div>
                <div className="relative bg-[#1E293B] rounded-lg p-6 h-full flex flex-col border border-white/10 backdrop-blur-sm shadow-lg hover:shadow-[0_0_30px_rgba(8,8,8,0.3)] transition-all duration-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="relative">
                      <div
                        className="absolute -inset-1 blur-sm opacity-70"
                        style={{ backgroundColor: topic.color }}
                      ></div>
                      <div
                        className="relative text-white"
                        style={{ color: topic.color }}
                      >
                        {topic.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-4 flex-grow">
                    {topic.description}
                  </p>
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Includes:
                    </h4>
                    <ul className="space-y-1">
                      {topic.topics.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-400 flex items-center"
                        >
                          <span
                            className="mr-2 h-1.5 w-1.5 rounded-full inline-block"
                            style={{ backgroundColor: topic.color }}
                          ></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 relative">
        <div className="absolute inset-0 bg-[#1E293B]/30 backdrop-blur-sm -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1]/20 to-[#EC4899]/20 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#0F172A] rounded-lg overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(8,8,8,0.7)]">
                  <div className="bg-[#1E293B] px-4 py-2 border-b border-white/10 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="ml-4 text-sm font-mono text-gray-400 flex items-center">
                      <span className="text-[#6366F1] mr-1">~</span>
                      /first_principles.ts
                    </div>
                  </div>
                  <pre
                    className="p-4 text-sm font-mono overflow-x-auto bg-[#0F172A]/80"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <code className="language-typescript text-left">
                      <div className="text-[#6366F1]">interface</div>
                      <div className="text-gray-300"> Concept {"{"}</div>
                      <div className="pl-4 text-gray-300">name: string;</div>
                      <div className="pl-4 text-gray-300">
                        components: Component[];
                      </div>
                      <div className="text-gray-300">{"}"}</div>
                      <div className="text-gray-300"></div>
                      <div className="text-[#6366F1]">function</div>
                      <div className="text-[#10B981]">
                        {" "}
                        learnFromFirstPrinciples
                      </div>
                      <div className="text-gray-300">
                        (concept: Concept): Understanding {"{"}
                      </div>
                      <div className="pl-4 text-gray-500">
                        // Decompose the concept to its fundamental parts
                      </div>
                      <div className="pl-4 text-[#6366F1]">const</div>
                      <div className="pl-4 text-gray-300">
                        {" "}
                        components = decompose(concept);
                      </div>
                      <div className="pl-4 text-[#6366F1]">let</div>
                      <div className="pl-4 text-gray-300">
                        {" "}
                        understanding = new Understanding();
                      </div>
                      <div className="pl-4 text-gray-300"></div>
                      <div className="pl-4 text-gray-500">
                        // Build up from the foundation
                      </div>
                      <div className="pl-4 text-[#6366F1]">for</div>
                      <div className="pl-4 text-gray-300">
                        {" "}
                        (const component of components) {"{"}
                      </div>
                      <div className="pl-8 text-gray-300">
                        understanding.add(
                      </div>
                      <div className="pl-12 text-gray-300">
                        exploreComponent(component)
                      </div>
                      <div className="pl-8 text-gray-300">);</div>
                      <div className="pl-4 text-gray-300">{"}"}</div>
                      <div className="pl-4 text-gray-300"></div>
                      <div className="pl-4 text-[#6366F1]">return</div>
                      <div className="pl-4 text-gray-300"> understanding;</div>
                      <div className="text-gray-300">{"}"}</div>
                    </code>
                  </pre>
                  {/* Terminal cursor blinking effect */}
                  <div className="h-4 w-2 bg-gray-300 opacity-75 animate-pulse absolute bottom-4 left-[196px]"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block mb-3">
                <div className="bg-[#1E293B] border border-white/10 rounded-full px-4 py-1 text-sm font-medium text-gray-300">
                  Our approach
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Our Teaching Philosophy
              </h2>
              <p className="text-lg text-gray-400">
                We believe that truly understanding programming comes from
                breaking it down to its fundamental principles, then building
                knowledge back up in a structured way.
              </p>

              <div className="space-y-4 mt-8">
                {[
                  {
                    title: "Decomposition",
                    description:
                      "Breaking complex topics into their simplest components until they're intuitive.",
                    color: "#6366F1", // Purple
                  },
                  {
                    title: "Reconstruction",
                    description:
                      "Building knowledge back up from fundamentals to create robust mental models.",
                    color: "#EC4899", // Pink
                  },
                  {
                    title: "Practical Application",
                    description:
                      "Applying theoretical knowledge to real-world projects to cement understanding.",
                    color: "#14B8A6", // Teal
                  },
                ].map((item, index) => (
                  <div key={index} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-white/0 rounded-md blur-sm group-hover:from-white/10 group-hover:to-white/0 transition duration-300"></div>
                    <div className="relative bg-[#1E293B] p-4 rounded-md border border-white/10 flex">
                      <div className="mr-4 mt-1 h-full">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#topics"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Topics
                  </a>
                </li>
                <li>
                  <a
                    href="#philosophy"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Philosophy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cookies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full blur-sm opacity-70"></div>
                <div className="relative bg-[#1E293B] rounded-full p-1">
                  <Code className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]">
                CodeFirst
              </span>
            </div>

            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CodeFirst. All rights reserved.
            </div>

            <div className="flex space-x-4">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  ),
                },
                { icon: <Github className="h-5 w-5" /> },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  ),
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  ),
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
