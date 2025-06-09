FROM node:20

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps

# Build the React/Vite app
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Serve the build output
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
