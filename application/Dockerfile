# pull the Node.js Docker image
FROM node:alpine

# create the directory inside the container
WORKDIR /usr/src/app

ENV ENV=PRODUCTION
# ENV PORT=4488
ENV PROTOCOL=https
# ENV HOST=localhost
ENV HOST=63b2-178-133-224-39.ngrok-free.app

# create backend folder
RUN mkdir -p backend

# copying package.json files
COPY ./backend ./backend

RUN cd ./backend && rm -rf frontend_build

# run npm install in our local machine

# copy the generated modules and all other files to the container
# COPY ./backend ./backend

# copy frontend the generated modules and all other files to the container
COPY ./frontend ./frontend

# build frontend application
RUN cd ./frontend && npm install && rm -rf ./build && npm run build && cp -r ./build ../backend/frontend_build

# build backend application
RUN cd ./backend && npm install && rm -rf ./dist && npm run build

# our app is running on port 4488 within the container, so need to expose it
EXPOSE 4488

# the command that starts our app
CMD ["node", "./backend/dist/src/main.js"]
