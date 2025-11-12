#!/bin/bash

# Setup script for AISalesAgent MVP
set -e

echo "Setting up AISalesAgent MVP..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install infrastructure dependencies
echo "Installing infrastructure dependencies..."
cd infra
npm install
cd ..

echo "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in backend/.env and frontend/.env"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"

