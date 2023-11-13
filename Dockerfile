# Use the official Node.js 14 image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the entire project to the working directory
COPY . .

# Install the dependencies
RUN npm install

# Command to run the app
CMD [ "npm", "start" ]
