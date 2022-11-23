#!/bin/bash

npm install --global yarn

yarn add jsonwebtoken@8.5.1
yarn add crypto@1.0.1
yarn add dotenv@16.0.0
yarn add express@4.17.3
yarn add redis@4.0.4

node /app/server.js
