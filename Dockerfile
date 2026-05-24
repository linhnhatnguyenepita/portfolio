FROM node:22.6.0

# Set working directory to /app
WORKDIR /app

# Copy package.json to /app
COPY package*.json .

# copy dependencies . . means all files in current directory with node_modules and other files
COPY . .


# run npm install to install dependencies
RUN npm install

ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET

RUN npm run build

# expose port 3000
EXPOSE 3000


# npm run start to run the app
CMD [ "npm","run","start" ]