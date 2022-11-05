FROM node:16

WORKDIR /app

COPY ["package.json", "package-lock.json",".env", "tsconfig.json", "tsconfig.build.json", "nest-cli.json", "./"]

RUN npm ci

EXPOSE 3000
CMD npm run start
