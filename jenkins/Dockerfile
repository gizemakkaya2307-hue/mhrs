FROM jenkins/jenkins:lts-jdk17
USER root

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Confirm installation
RUN node -v
RUN npm -v

USER jenkins
