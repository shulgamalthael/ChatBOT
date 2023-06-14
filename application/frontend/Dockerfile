# pull the Node.js Docker image
FROM node:alpine

# create the directory inside the container
WORKDIR /usr/src/app

ENV ENV=PRODUCTION
# ENV PORT=4487
ENV API_PROTOCOL=https
# ENV API_HOST=localhost
ENV API_HOST=df3c-89-209-204-250.ngrok-free.app

# copying package.json files
COPY . .

# build frontend application
RUN npm install && npm install -g serve && rm -rf build && npm run build

# our app is running on port 4488 within the container, so need to expose it
EXPOSE 4487

# the command that starts our app
CMD ["serve", "-s", "build", "-l", "4487"];
