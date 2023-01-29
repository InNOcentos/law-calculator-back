FROM node:16

WORKDIR /app

COPY ["package.json", "package-lock.json",".env", "tsconfig.json", "nest-cli.json", "./"]

RUN npm install rimraf

RUN npm install -g @nestjs/cli

RUN npm install

COPY . .

RUN npm run build

CMD npm run start:dev
