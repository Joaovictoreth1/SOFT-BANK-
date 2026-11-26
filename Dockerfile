FROM node:24-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build
WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY vite.config.js postcss.config.js tailwind.config.js nginx.conf ./
COPY src ./src
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
