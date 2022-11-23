# API Token System

#### Token system for create and validate api keys, including refreshing tokens


```sh
yarn install
```
```sh
source .env
```

```sh
node server.js
```

```sh
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
ssh-keygen -f jwtRS256.key.pub -e -m pem
```

## Usage

#### Generate new token
```sh
http://localhost:1234/generate/[ID]
```

#### Validate token
```sh
http://localhost:1234/validate/[token]
```

#### Refresh token
```sh
http://localhost:1234/refresh/[token]
```