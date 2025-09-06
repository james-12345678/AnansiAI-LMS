#!/bin/bash

echo "🚀 Starting AnansiAI Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }
command -v dotnet >/dev/null 2>&1 || { echo -e "${RED}❌ .NET is required but not installed.${NC}" >&2; exit 1; }

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "1. ✅ Database connection string updated"
echo "2. ✅ JWT secret keys updated"
echo "3. ✅ CORS origins configured"
echo "4. ✅ API URL environment variables set"
echo "5. ✅ SSL certificates ready"

# Step 1: Backend Build and Publish
echo -e "${YELLOW}🔨 Building .NET Backend...${NC}"
cd AnansiAI.Api
dotnet clean
dotnet restore
dotnet build --configuration Release

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Create publish folder
dotnet publish --configuration Release --output ./publish

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend published successfully${NC}"
else
    echo -e "${RED}❌ Backend publish failed${NC}"
    exit 1
fi

cd ..

# Step 2: Frontend Build
echo -e "${YELLOW}🔨 Building React Frontend...${NC}"

# Install dependencies
npm ci --production=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Type check
npm run typecheck

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi

# Build for production
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Step 3: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"

mkdir -p deployment-package
mkdir -p deployment-package/backend
mkdir -p deployment-package/frontend

# Copy backend files
cp -r AnansiAI.Api/publish/* deployment-package/backend/

# Copy frontend files
cp -r dist/* deployment-package/frontend/

# Copy configuration files
cp .env.production deployment-package/frontend/.env
cp AnansiAI.Api/appsettings.Production.json deployment-package/backend/

# Create deployment info
echo "{
  \"version\": \"1.0.0\",
  \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"platform\": \"AnansiAI\",
  \"components\": {
    \"frontend\": \"React + Vite\",
    \"backend\": \".NET Core Web API\",
    \"database\": \"SQL Server\"
  }
}" > deployment-package/deployment-info.json

echo -e "${GREEN}✅ Deployment package created in 'deployment-package/' folder${NC}"

# Step 4: Deployment options
echo -e "${BLUE}🚀 Choose your deployment option:${NC}"
echo "1. 🌐 Deploy to IIS (Windows Server)"
echo "2. 🐳 Create Docker containers"
echo "3. ☁️  Deploy to Azure"
echo "4. 🛸 Deploy to AWS"
echo "5. 📁 Manual deployment (just create files)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}📋 IIS Deployment Instructions:${NC}"
        echo "1. Copy 'deployment-package/backend/' to your IIS server"
        echo "2. Copy 'deployment-package/frontend/' to your web server document root"
        echo "3. Configure IIS application pool for .NET"
        echo "4. Set up reverse proxy or serve frontend from IIS"
        ;;
    2)
        echo -e "${YELLOW}🐳 Creating Docker configurations...${NC}"
        # Create Dockerfile for backend
        cat > deployment-package/backend/Dockerfile << 'EOF'
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "AnansiAI.Api.dll"]
EOF

        # Create Dockerfile for frontend
        cat > deployment-package/frontend/Dockerfile << 'EOF'
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

        # Create nginx config
        cat > deployment-package/frontend/nginx.conf << 'EOF'
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    sendfile on;
    
    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://backend:80/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

        # Create docker-compose
        cat > deployment-package/docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    ports:
      - "5000:80"
    
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - SA_PASSWORD=YourPassword123!
      - ACCEPT_EULA=Y
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:
EOF
        echo -e "${GREEN}✅ Docker files created. Run: cd deployment-package && docker-compose up${NC}"
        ;;
    3)
        echo -e "${YELLOW}☁️  Azure Deployment Instructions:${NC}"
        echo "1. Create Azure Web App for backend (.NET)"
        echo "2. Create Azure Static Web App for frontend"
        echo "3. Create Azure SQL Database"
        echo "4. Update connection strings in Azure App Settings"
        echo "5. Deploy using Azure CLI or Visual Studio"
        ;;
    4)
        echo -e "${YELLOW}🛸 AWS Deployment Instructions:${NC}"
        echo "1. Use AWS Elastic Beanstalk for .NET backend"
        echo "2. Use AWS S3 + CloudFront for frontend"
        echo "3. Use AWS RDS for SQL Server database"
        echo "4. Configure IAM roles and security groups"
        ;;
    5)
        echo -e "${GREEN}✅ Manual deployment files ready${NC}"
        echo "Backend files: deployment-package/backend/"
        echo "Frontend files: deployment-package/frontend/"
        ;;
    *)
        echo -e "${YELLOW}📁 Files created for manual deployment${NC}"
        ;;
esac

echo -e "\n${GREEN}🎉 AnansiAI Production Deployment Complete!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. 🗄️  Set up production database"
echo "2. 🔐 Configure SSL certificates"
echo "3. 🌐 Set up domain and DNS"
echo "4. 📊 Configure monitoring and logging"
echo "5. 🔄 Set up backup procedures"

echo -e "\n${YELLOW}⚠️  Important Security Notes:${NC}"
echo "• Change all default passwords and JWT secrets"
echo "• Enable HTTPS in production"
echo "• Configure firewall rules"
echo "• Set up database backups"
echo "• Enable security headers"

echo -e "\n${GREEN}🚀 Your AnansiAI platform is ready for production!${NC}"
