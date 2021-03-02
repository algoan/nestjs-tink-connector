# ---------------
# Pull node image as Builder. we will transpile Ts files to Js here
# ---------------
FROM node:lts-alpine as builder

# Create app directory
WORKDIR /usr/src/app

# copy sources files
COPY package*.json ./
COPY src ./src
COPY tsconfig*.json ./
COPY config ./config

# Install dependencies
RUN npm ci
# Transpile Typescript code to ES6 code into dist folder
RUN npm run build
# ---------------
# Multistage docker. This will be the final image
# ---------------
FROM node:lts-alpine

WORKDIR /usr/src/app

# Install only production dependencies and clean tool builders
COPY package* ./
ENV NODE_ENV 'production'

# Copy secrets and config
COPY --from=builder /usr/src/app/config config

# Copy previously generated code
COPY --from=builder /usr/src/app/dist dist

RUN npm ci

USER node

# Set NODE_ENV to production and open
ENV PORT 8080
ENV DEPLOYMENT 'production.secret'

EXPOSE 8080

CMD [ "node", "dist/main.js"]
