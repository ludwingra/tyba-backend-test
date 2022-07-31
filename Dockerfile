FROM node:16

WORKDIR /usr/src

EXPOSE 4020

CMD [ "npm", "run", "start_serve" ]