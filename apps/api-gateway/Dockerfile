###################
# BUILD FOR LOCAL DEVELOPMENT
###################

ARG NODE_VERSION
FROM node:${NODE_VERSION} AS development
WORKDIR /srv

# Copy dependency manifests first to leverage Docker cache
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy rest of the application code
COPY --chown=node:node . .

# Set user and start development server
USER node
CMD ["npm", "run", "start:dev"]


###################
# BUILD FOR PRODUCTION
###################

FROM node:${NODE_VERSION} AS build
WORKDIR /srv

# Copy necessary files for installing dependencies and build
COPY --chown=node:node package.json package-lock.json* ./
COPY --from=development /srv/node_modules ./node_modules

# Copy rest of the source code
COPY --chown=node:node . ./

# Run build
RUN npm run build

# Optimize dependencies for production
RUN npm ci --only=production --legacy-peer-deps


###################
# PRODUCTION
###################

FROM node:${NODE_VERSION} AS production
ARG target_app

USER node
WORKDIR /srv

# Copy package.json, node_modules and compiled dist directory
COPY --chown=node:node --from=build /srv/package.json ./
COPY --chown=node:node --from=build /srv/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/dist ./dist

# Environment Variables for Node.js
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=128

# Run as non-root user and start the application
CMD ["node", "dist/main.js"] 