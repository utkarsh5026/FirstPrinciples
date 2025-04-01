---
title: Docker from First Principles
id: doc-001
createdAt: 2025-03-15T10:30:00Z
updatedAt: 2025-03-28T14:22:00Z
category: DevOps
tags: [docker, containers, devops]
---
# Docker Fundamentals: Containers vs VMs

Docker uses containerization, a lightweight alternative to virtual machines. Let's understand the key differences:

## Virtual Machines

- Include full OS copy
- Slow to start (minutes)
- Resource heavy
- Complete isolation
- GB in size

## Docker Containers

- Share host OS kernel
- Start in seconds
- Lightweight
- Process-level isolation
- MB in size

> At its core, Docker is about running processes in isolated environments with their own filesystem, networking, and process tree, but sharing the same kernel as the host.

# Docker Architecture

Docker follows a client-server architecture with these main components:

```
┌────────────┐      ┌─────────────┐     ┌────────────────┐
│            │      │             │     │                │
│   Docker   │ <--> │   Docker    │ <-> │    Docker      │
│   Client   │      │   Daemon    │     │    Registry    │
│            │      │             │     │                │
└────────────┘      └─────────────┘     └────────────────┘
```

## Key Components

1. **Docker Client**: The CLI tool you interact with when running docker commands
2. **Docker Daemon (dockerd)**: The background service that builds, runs, and manages containers
3. **Docker Registry**: Stores Docker images (Docker Hub is the public registry)

### Key Concepts

- **Images**: Read-only templates used to create containers (like a class)
- **Containers**: Running instances of images (like objects)
- **Dockerfile**: Text document with instructions to build an image

---

# Getting Started: Installation & First Commands

## Installation

Docker Desktop is available for:

- Windows (requires WSL2 or Hyper-V)
- macOS (Intel and Apple Silicon)
- Linux (various distributions)

```bash
# Verify installation
$ docker --version
Docker version 25.0.3, build 4debf41

# Run your first container
$ docker run hello-world
Hello from Docker!
This message shows that your installation appears to be working correctly...
```

After installation, try these essential commands:

```bash
# List running containers
$ docker ps

# List all containers (including stopped)
$ docker ps -a
```
