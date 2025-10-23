# Use the latest Playwright Node.js base image (supports JavaScript/TypeScript)
FROM mcr.microsoft.com/playwright:v1.54.2-jammy

# Set working directory
WORKDIR /usr/src/app


# Install system packages for ROSA CLI and AWS CLI
RUN apt-get update && apt-get install -y \
    curl unzip tar \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ROSA CLI
RUN curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/rosa/latest/rosa-linux.tar.gz && \
    tar --no-same-owner -xzf rosa-linux.tar.gz && \
    mv rosa /usr/local/bin/ && \
    chmod +x /usr/local/bin/rosa && \
    rm rosa-linux.tar.gz

# Install AWS CLI (required by ROSA)
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

CMD ["npx", "playwright", "test"]
