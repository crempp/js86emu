FROM node:9.11.1

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app
COPY . /app

RUN npm run build

EXPOSE 8080

# Launch application
CMD ["npm","run","run:web"]
