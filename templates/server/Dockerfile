# Run the server in a container:
#
#   docker build -t my-server .
#   docker run -p 3000:3000 -e ALLOWED_ORIGIN=https://your-game.example my-server
FROM node:22-slim

WORKDIR /app

# Install the dependencies first, so that Docker can reuse them when only the
# code has changed.  (If you have a package-lock.json, `npm ci` is a better
# choice than `npm install`.)
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# The server listens on the PORT environment variable, or 3000
ENV PORT=3000
EXPOSE 3000

# Don't run as root
USER node

# Run tsx directly, instead of `npm start`, so that `docker stop` reaches the
# server and it shuts down right away
CMD ["node_modules/.bin/tsx", "src/index.ts"]
