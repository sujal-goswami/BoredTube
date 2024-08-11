# Stage 0: base image
FROM node:lts-alpine AS base
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

# Stage 1: Development environment
FROM base AS development
COPY . .
EXPOSE 8000
RUN chown -R node /app
USER node
CMD ["npm", "run", "dev"]

# Stage 2: Production environment
FROM base AS production
ENV NODE_ENV=production
COPY . .
RUN npm prune --production
EXPOSE 8000
RUN chown -R node /app
USER node
CMD ["npm", "run", "start"]
