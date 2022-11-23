#!/bin/bash

npm install --global yarn

yarn global add jsonwebtoken@8.5.1
yarn global add crypto@1.0.1
yarn global add dotenv@16.0.0
yarn global add express@4.17.3
yarn global add redis@4.0.4

node /app/server.js
