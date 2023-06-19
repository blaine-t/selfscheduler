# syntax=docker/dockerfile:1
FROM node:lts-alpine
# Update alpine
RUN apk update

# Create app directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.6.3 --activate

# Copy over dependency lists
COPY package.json ./
COPY pnpm-lock.yaml ./

# Update to `pnpm ci` when pnpm supports clean install
RUN pnpm install --prod --frozen-lockfile

# Copy javascript over
COPY ./dist ./dist

# Expose port 42042 and only 42042 in docker
EXPOSE 42042

CMD ["node", "dist/index.js"]