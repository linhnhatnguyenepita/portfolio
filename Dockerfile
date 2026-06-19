FROM oven/bun:1

# Set working directory to /app
WORKDIR /app

# Copy manifest and lockfile first to leverage Docker layer caching
COPY package.json bun.lock ./

# Install dependencies from the frozen lockfile (fails if lockfile is stale)
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET

RUN bun run build

# expose port 3000
EXPOSE 3000

# run the app
CMD [ "bun", "run", "start" ]
