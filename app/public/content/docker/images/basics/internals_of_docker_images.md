# Docker Image Internals: A First Principles Exploration

To truly understand Docker images at their deepest level, we need to start with the fundamental building blocks and work our way up, examining not just what Docker images are but how they're constructed at the binary and filesystem level.

## 1. The Essence of a Docker Image

At its most fundamental level, a Docker image is a carefully organized collection of files and metadata that:

1. Provides a complete, self-contained filesystem
2. Contains all dependencies needed to run an application
3. Includes configuration details about how containers should be instantiated
4. Is structured in layers for efficient storage and distribution

Unlike a typical application installation which mixes with your host system, Docker images are designed to be isolated, portable units that run consistently regardless of where they're deployed.

## 2. The Binary Format: Image Representation on Disk

Let's examine how Docker images actually exist on your computer's storage. An image is not stored as a single monolithic file but rather as a collection of component parts:

### 2.1 The Content-Addressable Storage System

Docker employs a content-addressable storage system where each component is identified by its content hash (typically SHA256). This means:

1. Each layer is stored once, regardless of how many images use it
2. Components can be verified for integrity by checking their hash
3. The system can easily determine what's already present locally

On a typical Linux system, these files are stored in `/var/lib/docker/` with a structure like:

```
/var/lib/docker/
├── image/
│   ├── overlay2/        # Storage driver specific image metadata
│   │   ├── distribution/
│   │   ├── imagedb/     # Database of image metadata
│   │   │   ├── content/
│   │   │   │   └── sha256/  # Image configs indexed by hash
│   │   │   └── metadata/
│   │   └── layerdb/     # Database of layer metadata
├── overlay2/            # Actual layer content
│   ├── <layer-id>/      # Content of each layer
```

When you download an image like `nginx:latest`, you're actually fetching:
- A manifest file listing the layers and their hashes
- A configuration file containing metadata
- Multiple layer tarballs containing filesystem differences

### 2.2 The Image Configuration

Every Docker image has a JSON configuration file that defines how it should behave when instantiated as a container. This configuration includes:

```json
{
  "architecture": "amd64",
  "os": "linux",
  "config": {
    "Hostname": "",
    "Domainname": "",
    "User": "",
    "ExposedPorts": {
      "80/tcp": {}
    },
    "Env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "NGINX_VERSION=1.21.1"
    ],
    "Cmd": [
      "nginx",
      "-g",
      "daemon off;"
    ],
    "WorkingDir": "",
    "Entrypoint": null,
    "Labels": {
      "maintainer": "NGINX Docker Maintainers"
    }
  },
  "rootfs": {
    "type": "layers",
    "diff_ids": [
      "sha256:2edcec3590a4ec7f40cf0743c15d78fb39d8326bc029073b41ef9727da6c851f",
      "sha256:e379e8aedd4d698674a7d67cd35e009e57fd1a72329a89fd238556fa0f7caa1b"
    ]
  },
  "history": [
    {
      "created": "2021-07-14T19:19:38.723476859Z",
      "created_by": "/bin/sh -c #(nop) ADD file:finder... in /"
    }
  ]
}
```

This configuration defines:
- The architecture and OS the image is built for
- Environment variables to set when running
- Default command to execute
- Network ports to expose
- Working directory
- User to run as
- Pointers to the layer content via their content hashes

## 3. Layer Structure: Content Storage

Each layer in a Docker image represents a specific change to the filesystem, stored as a tarball of file differences. The physical structure of these layers depends on the storage driver Docker is using.

### 3.1 Overlay2 Storage Driver (Most Common)

With the overlay2 driver (the current default for most Linux installations), each layer is stored as:

1. A directory containing the new or modified files for that layer
2. A "link" file pointing to the layer's parent
3. A "diff" directory containing actual file content
4. A "work" directory used for copy-on-write operations

For example, on the filesystem:

```
/var/lib/docker/overlay2/
├── e94f119606a800aab2188369d387c33f0474f6105a634cecd59ece12b3149667/
│   ├── diff/      # Actual files for this layer
│   │   ├── bin/
│   │   ├── etc/
│   │   └── var/
│   ├── link       # Name for the layer used in lowerdir
│   ├── lower      # ID of parent layer
│   └── work/      # Used for overlay fs operations
```

When a container runs, the overlay2 driver combines these layer directories using a **union mount**, which presents all the layers as a single unified filesystem to the container.

### 3.2 Inside a Layer Tarball

If we were to extract a layer tarball, we'd find:

1. All files added or modified in that layer step
2. Metadata about file permissions, ownership, and timestamps
3. Special "whiteout" files (named `.wh.filename`) that indicate files deleted from previous layers

For example, if a Dockerfile contained:

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nginx
```

The second layer would contain all the new or modified files from installing nginx, including:
- New executables in `/usr/sbin/`
- Configuration files in `/etc/nginx/`
- Documentation in `/usr/share/doc/`
- And so on...

## 4. The Union Filesystem: Making Layers Work Together

A key technology enabling Docker's layer system is the union filesystem. This allows multiple directories to be mounted together into a single view.

### 4.1 OverlayFS Mechanics

With OverlayFS (used by the overlay2 driver), layers are combined using:

1. **Lower directories**: Read-only layers (the image layers)
2. **Upper directory**: Read-write layer (for container changes)
3. **Work directory**: Used for operations like renaming files
4. **Merged directory**: The unified view presented to the container

When a running container tries to:

- **Read a file**: OverlayFS checks the upper directory first, then works down through the lower directories until it finds the file
- **Write to an existing file**: OverlayFS uses copy-on-write to bring the file to the upper directory before modification
- **Delete a file**: OverlayFS creates a "whiteout" file in the upper directory

This structure is what enables multiple containers to share the same underlying image layers while maintaining their own modifications.

### 4.2 Copy-on-Write Mechanism

The copy-on-write mechanism is central to Docker's efficiency:

1. When a container starts, it doesn't duplicate any image data
2. When a process in the container modifies a file, only then is that file copied to the container's writable layer
3. The original file in the image layer remains unchanged

This explains why starting multiple containers from the same image is almost instantaneous and uses minimal additional disk space.

## 5. Image Identifiers: Addressing the Layers

Docker uses a system of identifiers to reference images and their components:

### 5.1 Image IDs

Each image has a content-addressable ID based on its configuration file's SHA256 hash. For example:

```
sha256:d1a364dc548d5357f0da3268c888e1971bbdb957ee3f028fe7194f1d61c6fdee
```

This ID uniquely identifies the image and all its layers.

### 5.2 Layer IDs

Similarly, each layer has an ID derived from its content hash. Docker maintains a mapping between these cryptographic IDs and more human-readable references in its database.

### 5.3 Repository and Tags

For human usability, Docker allows referencing images by repository and tag:

```
nginx:1.21.1-alpine
```

Where:
- `nginx` is the repository
- `1.21.1-alpine` is the tag

In Docker's database, these friendly names are mapped to the corresponding content hashes.

## 6. Image Manifests: Distribution Format

When Docker images are distributed via registries, they follow the OCI (Open Container Initiative) Distribution Specification, which defines a format for image manifests.

### 6.1 Manifest Structure

A basic manifest for a single-architecture image looks like:

```json
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
  "config": {
    "mediaType": "application/vnd.docker.container.image.v1+json",
    "size": 7023,
    "digest": "sha256:d1a364dc548d5357f0da3268c888e1971bbdb957ee3f028fe7194f1d61c6fdee"
  },
  "layers": [
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 27091819,
      "digest": "sha256:2408cc74d12b6cd092bb8b516ba7d5e290f485d3eb9672efc00f0583730179e8"
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 23882259,
      "digest": "sha256:fe7001d28a4659e8e7b1f816c2db7fb5bcd9a9a9e12785e5a17f618e470558d1"
    }
  ]
}
```

This manifest:
- Points to a configuration file by its digest
- Lists each layer by its digest
- Includes the size of each component for download planning

### 6.2 Multi-Architecture Manifests

For images supporting multiple platforms (e.g., AMD64, ARM64), Docker uses a manifest list, sometimes called a "fat manifest":

```json
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",
  "manifests": [
    {
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "size": 948,
      "digest": "sha256:4d0148ddf41e1c1d5ec08081133cd597463d7fc39c53e55e7ac076969bae49a7",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      }
    },
    {
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "size": 948,
      "digest": "sha256:e5acf3439516dc4a4215d3338b86c398b1b69daf4dc92b39a348cf7a108b6538",
      "platform": {
        "architecture": "arm64",
        "os": "linux"
      }
    }
  ]
}
```

When you pull an image, Docker:
1. Fetches the appropriate manifest for your platform
2. Downloads the configuration file
3. Downloads each layer not already present locally
4. Verifies all downloaded content against their stated digests

## 7. Image Building: From Dockerfile to Layers

Let's examine how Docker translates a Dockerfile into the layered structure we've been exploring.

### 7.1 The Build Context

When you run `docker build`, you provide a build context - typically the current directory. This context is:

1. Tar-archived
2. Sent to the Docker daemon
3. Unpacked for use during the build process

Each instruction in the Dockerfile is executed in sequence, with each creating a new layer:

```dockerfile
FROM ubuntu:20.04          # Base layer from Ubuntu image
RUN apt-get update         # Layer 1: Update package lists
RUN apt-get install -y nginx # Layer 2: Install Nginx
COPY ./app /var/www/html/  # Layer 3: Copy application files
```

### 7.2 Layer Creation Process

For each instruction, Docker:

1. Creates a temporary container from the previous step's image
2. Executes the instruction inside that container
3. Captures filesystem changes as a new layer
4. Commits that layer with metadata about the instruction that created it
5. Removes the temporary container

For example, for the instruction `RUN apt-get update`:

1. Docker creates a container from the Ubuntu base image
2. It runs `apt-get update` in that container
3. It identifies which files were modified (mainly in `/var/lib/apt/`)
4. It creates a tarball of those changes
5. It adds a new layer with those changes to the image

### 7.3 Commit History

Each layer records metadata about:
- When it was created
- Which instruction created it
- The command executed (for RUN instructions)

This history is preserved in the image configuration and can be viewed with `docker history <image>`.

## 8. From Images to Containers: The Runtime View

When you run a container from an image, Docker uses the storage driver to assemble the layers into a unified view.

### 8.1 Container Startup Process

When you execute `docker run nginx`:

1. Docker checks if the nginx image exists locally; if not, it pulls it
2. Docker creates a new writable layer for the container
3. Docker sets up the union mount combining the image layers with the writable layer
4. Docker allocates a network interface and assigns an IP address
5. Docker executes the command specified in the image configuration (or the command override provided in `docker run`)

### 8.2 Container Layer Structure

The running container has:

1. All the read-only layers from the image
2. A new writable layer at the top where all changes are stored
3. A unified view that makes this complex structure appear as a normal filesystem

On disk, the container's writable layer is stored similarly to image layers:

```
/var/lib/docker/overlay2/
└── 731e9872d929d46d4d9c7bcd63f08ac657ac31854ad0548dd64c01609a6c763a/ # Container ID
    ├── diff/      # Container's writable layer
    ├── merged/    # Unified view (container's root filesystem)
    ├── work/      # OverlayFS workdir
    └── lower      # References to image layers
```

When the container writes files, modifies existing files, or deletes files, these changes are stored in the `diff` directory.

## 9. Advanced Techniques: Multi-Stage Builds

Modern Docker practices often use multi-stage builds to optimize image size and security. Let's examine how these work at the filesystem level.

### 9.1 Multi-Stage Build Example

```dockerfile
# Build stage
FROM golang:1.16 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

# Final stage
FROM alpine:3.14
COPY --from=builder /app/myapp /usr/local/bin/
CMD ["myapp"]
```

### 9.2 Behind the Scenes

When Docker processes this Dockerfile:

1. It builds a complete intermediate image from the golang base through the compile step
2. It starts a new image build from the alpine base
3. It extracts the compiled binary from the first image and adds it to the second image
4. The final image contains only the alpine base plus the binary

At the filesystem level, this creates:
- A full golang image with all layers (not used in the final result)
- A minimal alpine image with one additional layer containing just the binary

The intermediate build image isn't automatically deleted, but can be removed with `docker image prune`.

## 10. Image Registries: Storage and Distribution

Docker images are typically stored in and retrieved from registries. The most common is Docker Hub, but many organizations run private registries.

### 10.1 Registry API

Registries implement the OCI Distribution Specification, which defines a REST API for operations like:

- Pushing and pulling images
- Listing tags
- Checking if blobs exist

When you pull an image, Docker:
1. Contacts the registry API to get the manifest
2. Checks which layers are missing locally
3. Downloads only the missing layers

### 10.2 Registry Storage

In a registry, images are stored as:
- Manifests (JSON files)
- Configuration blobs (JSON files)
- Layer blobs (compressed tarballs)

Each component is stored by its content hash, enabling deduplication across images.

## 11. Security Considerations in Image Structure

The layered nature of Docker images has important security implications.

### 11.1 Layer History and Secrets

Because each layer preserves its history, a common mistake is exposing sensitive data:

```dockerfile
RUN echo "mypassword" > /tmp/pass && \
    some-command --password-file=/tmp/pass && \
    rm /tmp/pass
```

Even though the password file is deleted, it exists in the layer where it was created. A subsequent `docker history --no-trunc` could reveal it.

The solution is multi-stage builds or using build-time secrets:

```dockerfile
# Using Docker BuildKit secrets
RUN --mount=type=secret,id=mypass some-command --password-file=/run/secrets/mypass
```

### 11.2 Base Image Security

Since each image builds on its base, the security of the base image is critical. A compromised base image can affect all derived images.

Docker's Official Images employ several security practices:
- Minimal base images to reduce attack surface
- Regular security updates
- Automated vulnerability scanning
- Signed image content

## 12. Image Optimization Techniques

Understanding image internals allows for effective optimization.

### 12.1 Layer Optimization

To minimize layer size:

1. **Combine related operations**:
   ```dockerfile
   # Bad: Creates two layers
   RUN apt-get update
   RUN apt-get install -y package
   
   # Good: Creates one layer
   RUN apt-get update && apt-get install -y package
   ```

2. **Clean up within the same layer**:
   ```dockerfile
   RUN apt-get update && \
       apt-get install -y package && \
       apt-get clean && \
       rm -rf /var/lib/apt/lists/*
   ```

### 12.2 Minimizing Image Size

To reduce overall image size:

1. **Use appropriate base images**:
   - Alpine Linux for minimal size (~5MB)
   - Debian slim variants for better compatibility
   - Distroless images for compiled applications

2. **Remove unnecessary files**:
   ```dockerfile
   RUN apt-get update && \
       apt-get install -y package && \
       rm -rf /usr/share/doc /usr/share/man
   ```

3. **Use multi-stage builds** to separate build-time dependencies from runtime needs

### 12.3 Layer Caching Strategy

Order Dockerfile instructions from least to most frequently changed:

```dockerfile
FROM python:3.9-alpine

# Rarely changes
RUN apk add --no-cache gcc musl-dev

# Changes when dependencies change
COPY requirements.txt .
RUN pip install -r requirements.txt

# Changes frequently
COPY . .
```

This maximizes cache usage during development, as unchanged layers can be reused.

## 13. OCI Compatibility: The Open Standard

Docker images now conform to the Open Container Initiative (OCI) specifications, making them compatible with other container runtimes.

### 13.1 OCI Image Specification

The OCI Image Specification defines:
- Image manifest format
- Configuration format
- Layer format
- Content-addressable storage requirements

This standardization means Docker images can be run by other OCI-compatible runtimes like containerd, CRI-O, and Podman.

### 13.2 OCI Runtime Specification

The OCI also defines a runtime specification, which determines how container runtimes like runc (used by Docker) execute containers from images.

This specification includes:
- Filesystem bundle format
- Process isolation requirements
- Resource limitations
- Lifecycle operations

## 14. Advanced Features of Modern Images

Recent Docker versions have introduced additional features to the image format.

### 14.1 BuildKit and New Dockerfile Features

Docker BuildKit provides enhanced image building with features like:

1. **Parallel processing** of independent build stages
2. **Build secrets** for handling sensitive data:
   ```dockerfile
   RUN --mount=type=secret,id=apikey cat /run/secrets/apikey
   ```
3. **SSH forwarding** for accessing private repositories:
   ```dockerfile
   RUN --mount=type=ssh ssh-keyscan github.com >> /known_hosts
   ```
4. **Mount caching** for package managers:
   ```dockerfile
   RUN --mount=type=cache,target=/var/cache/apt apt-get update
   ```

These features work by extending the image format with additional metadata.

### 14.2 Image Annotations and Labels

Docker images can carry metadata in the form of labels:

```dockerfile
LABEL maintainer="example@example.com"
LABEL version="1.0"
LABEL description="Example image"
```

These labels are stored in the image configuration file and can be used for:
- Documentation
- Versioning
- Organizational purposes
- Integration with CI/CD systems

## 15. Conclusion: The Elegance of Docker's Design

Docker's image format represents a elegant solution to software distribution. By decomposing applications into layers of filesystem differences, Docker achieves:

1. **Efficiency**: Sharing common layers between images
2. **Speed**: Quickly creating containers without duplicating data
3. **Consistency**: Ensuring the same execution environment everywhere
4. **Portability**: Making applications run on any system with a container runtime

Understanding the internal structure of Docker images gives you the knowledge to:
- Build smaller, more efficient images
- Troubleshoot layer-related issues
- Make informed decisions about image design
- Implement proper security practices
- Optimize both build times and runtime performance

This deep knowledge forms the foundation for effectively working with containers at scale in modern cloud-native environments.