# pull the Node.js Docker image
FROM node:alpine

# create the directory inside the container
WORKDIR /usr/src/app

ENV ENV = PRODUCTION
ENV PORT = 4488
ENV PROTOCOL = https
ENV DOMAIN = localhost

# create backend folder
RUN mkdir -p backend

# copying package.json files
COPY ./backend/package.json ./backend

# run npm install in our local machine
RUN cd ./backend && npm install

# copy the generated modules and all other files to the container
COPY ./backend ./backend

# copy frontend the generated modules and all other files to the container
COPY ./frontend ./frontend

# build frontend application
RUN cd ./frontend && npm install && npm run build && cp -r ./build ../backend/frontend_build

# build new application
RUN cd ./backend && rm -rf ./dist && npm run build

# our app is running on port 4488 within the container, so need to expose it
EXPOSE 4488

# the command that starts our app
CMD ["node", "./backend/dist/src/main.js"]
