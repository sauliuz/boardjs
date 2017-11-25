FROM node:9-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
COPY package-lock.json .

# building code for production
RUN npm install --only=production
#RUN npm install

# Bundle app source
COPY . .

EXPOSE 3030
CMD [ "npm", "start" ]