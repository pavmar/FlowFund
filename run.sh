#!/bin/bash 

echo "Starting FlowFund services..."
docker run -d -p 8545:8545 psiddegowda/flowfund-hardhat:latest
docker run -d -p 9090:9090 psiddegowda/flowfund-server:latest
docker run -d -p 5173:5173 psiddegowda/flowfund-frontend:latest
echo "FlowFund services started."