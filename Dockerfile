# Use the alpine Node.js 20 image.
FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package.json yarn.lock ./

# Install dependencies.
RUN apk --no-cache add git && yarn add xivapi/lodestone-css-selectors && yarn install

# Copy local code to the container image.
COPY . .

# Change ownership of the app directory to the node non-root user.
RUN chown -R node:node /usr/src/app

# Switch to node non-root user.
USER node

# Expose the port the app runs on.
EXPOSE 8080

# Run the web service on container startup.
CMD [ "yarn", "run", "express:start" ]
