FROM amazonlinux:2023

# Install dependencies
RUN dnf install -y \
    nodejs \
    npm \
    curl \
    unixODBC \
    unixODBC-devel \
    glibc-langpack-en

# Add Microsoft repo for SQLCMD (RHEL 8 compatible)
RUN curl -o /etc/yum.repos.d/msprod.repo https://packages.microsoft.com/config/rhel/8/prod.repo

# Install SQL Server tools (sqlcmd + bcp)
RUN dnf install -y mssql-tools

# Add sqlcmd to PATH
ENV PATH="$PATH:/opt/mssql-tools/bin"

# Set timezone
RUN dnf install -y tzdata && \
    ln -fs /usr/share/zoneinfo/America/Chicago /etc/localtime && \
    echo "America/Chicago" > /etc/timezone

# Create working directory
WORKDIR /app

# Copy app files
COPY package*.json ./
RUN npm install

COPY . .

# Start scheduler
CMD ["node", "scheduler.js"]
