FROM node:20

# Create app directory
WORKDIR /app

# Copy project files
COPY package*.json ./
COPY scheduler.js ./
COPY app ./app

# Install dependencies
RUN npm install

# Run the scheduler script
CMD ["node", "scheduler.js"]
