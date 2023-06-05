# pull the Node.js Docker image
FROM node:alpine

# create the directory inside the container
WORKDIR /usr/src/app

# create backend folder
RUN mkdir -p frontend

# copying package.json files
COPY package.json ./frontend

# run npm install in our local machine
# RUN cd ./backend && npm install

# copy the generated modules and all other files to the container
COPY . ./frontend

# build frontend application
RUN cd ./frontend && npm install && rm -rf ./build && npm run build

# our app is running on port 4488 within the container, so need to expose it
EXPOSE 4488

RUN npm install pm2 -g

CMD ["pm2-runtime", "node", "./frontend/src/deploying.js"]
