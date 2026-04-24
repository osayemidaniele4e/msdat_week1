# =========================
# STAGE 1: Build frontend
# =========================
FROM node:16-alpine AS build
WORKDIR /app

# The CI will pass these in during 'docker build'
ARG VUE_APP_API_BASE_URL
ARG VUE_APP_API_LOGIN_URL
ARG VUE_APP_API_GPT_URL
ARG VUE_APP_FRONTEND_KEY_ID
ARG VUE_APP_FRONTEND_AUTH

# Map ARGs to ENVs so Vue's build process sees them
ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL \
    VUE_APP_API_LOGIN_URL=$VUE_APP_API_LOGIN_URL \
    VUE_APP_API_GPT_URL=$VUE_APP_API_GPT_URL \
    VUE_APP_FRONTEND_KEY_ID=$VUE_APP_FRONTEND_KEY_ID \
    VUE_APP_FRONTEND_AUTH=$VUE_APP_FRONTEND_AUTH

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# =========================
# STAGE 2: Runtime image
# =========================
FROM node:16-alpine
WORKDIR /app
RUN npm install -g pm2

# Copy only what is needed
COPY --from=build /app/dist ./dist
COPY server ./server
COPY ecosystem.config.js ./
# Install production server deps directly in runtime or copy from a deps stage
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
