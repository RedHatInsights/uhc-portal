FROM registry.ci.openshift.org/ci/rosa-aws-cli:latest AS builder
WORKDIR /usr/bin

FROM quay.io/openshifttest/cypress-included:14.3.2

COPY --from=builder /usr/bin/curl /usr/bin/curl
COPY --from=builder /usr/bin/unzip /usr/bin/unzip
COPY --from=builder /usr/bin/ocm /usr/bin/ocm
COPY --from=builder /usr/bin/rosa /usr/bin/rosa

RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip -q awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws &&\
    aws --version


