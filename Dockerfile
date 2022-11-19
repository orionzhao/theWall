FROM ubuntu:18.04
RUN apt update
RUN apt install -y curl python build-essential libkrb5-dev

ENV NODE_VERSION=10.24.1
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version 

EXPOSE 80

WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "app.js"]