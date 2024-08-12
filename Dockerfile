# Stage 1: base image
FROM node:lts-alpine AS base
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

# Stage 2: Development environment
FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 8000
RUN chown -R node /app
USER node
CMD ["npm", "run", "dev"]

# Stage 3: Production environment
FROM base AS production
ENV NODE_ENV=production
COPY . .
RUN rm -rf tests
RUN npm prune --production
EXPOSE 8000
RUN chown -R node /app
USER node
CMD ["npm", "run", "start"]
