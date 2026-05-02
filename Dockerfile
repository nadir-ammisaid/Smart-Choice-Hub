# Use the latest Dockerfile syntax version, which allows using BuildKit's enhanced features.
# This line is optional, but useful if you later use advanced Docker build features.
#syntax=docker/dockerfile:1.4

# Start with the official Node.js 20 image based on Alpine Linux for a smaller base image.
# Alpine keeps the image lightweight, though some native packages may require compatibility libraries.
FROM node:20-alpine

# Install necessary packages.
# libc6-compat is often needed for compatibility with some npm packages that expect glibc-like behavior.
# --no-cache avoids storing the package index in the final image, keeping the image smaller.
# hadolint ignore=DL3018
RUN apk add --no-cache libc6-compat

# Set the working directory for the application.
# All following commands will run from /usr/src/app inside the container.
WORKDIR /usr/src/app

# Copy only package files first.
# This improves Docker cache usage: dependencies are reinstalled only when package files change,
# instead of every time the source code changes.
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install npm packages for the monorepo.
# This installs dependencies for the root workspace and child workspaces.
RUN npm install

# Copy the rest of the application source code after installing dependencies.
# This keeps the dependency layer cached when only source files change.
COPY . .

# Build the backend during the Docker image build.
# Important: the build must create dist/src/main.js before the container starts.
# Do not run database migrations here; Docker image builds should not depend on the database being available.
RUN npm run build --workspace=@js-monorepo/server

# Document the port used by the backend.
# Railway still needs the correct public networking target port configured, usually 3310 for this app.
EXPOSE 3310

# Start the backend when the container runs.
# The container should only start the already-built app, not build it again at runtime.
CMD ["npm", "run", "start", "--workspace=@js-monorepo/server"]