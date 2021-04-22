# Stage 1: Build
FROM node:14-alpine
WORKDIR /var/app/

COPY . /var/app/
# NPM_TOKEN must have read access to @take-two-t2gp on Github
ARG NPM_TOKEN
RUN npm config set '//npm.pkg.github.com/:_authToken' "${NPM_TOKEN}"
RUN npm config set @take-two-t2gp:registry https://npm.pkg.github.com/
RUN cat ~/.npmrc
RUN npm ci
RUN npm run build
RUN rm ~/.npmrc

# Stage 2: Run
FROM node:14-alpine
WORKDIR /var/app/
COPY --from=0 /var/app/dist ./dist
COPY --from=0 /var/app/package.json /var/app/package-lock.json ./
ARG NPM_TOKEN
RUN npm config set '//npm.pkg.github.com/:_authToken' "${NPM_TOKEN}"
RUN npm config set @take-two-t2gp:registry https://npm.pkg.github.com/
RUN npm ci --only=production
RUN rm ~/.npmrc

# Start app
CMD ["npm", "run", "serve"]
