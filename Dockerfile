# Stage1 Build an Angular Docker Iage

FROM node:18.0.0

WORKDIR /app

COPY package*.json /app/

COPY . /app

RUN npm install 

ARG configuration=production

RUN cat package.json 

RUN npm run build --outputPath=./dist/out/ 

# Stage 

CMD ["npm" , "start"]

