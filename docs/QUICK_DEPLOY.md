# 🚀 Quick Production Deployment - AnansiAI

## **🎯 Ready to Deploy? Choose Your Path:**

### **🏃‍♂️ Option 1: One-Click Deploy (Recommended)**

```bash
./deploy-production.sh
```

This script will:

- ✅ Build your .NET backend
- ✅ Build your React frontend
- ✅ Create deployment package
- ✅ Generate Docker files
- ✅ Provide deployment options

### **🛠️ Option 2: Manual Deploy**

#### **Step 1: Backend (.NET API)**

```bash
cd AnansiAI.Api
dotnet publish -c Release -o ./publish
```

#### **Step 2: Frontend (React)**

```bash
npm ci
npm run build
```

#### **Step 3: Configure Production**

1. Update `AnansiAI.Api/appsettings.Production.json`
2. Update `.env.production`
3. Deploy to your server

---

## **☁️ Cloud Deployment Options**

### **🔷 Azure (Microsoft)**

**Backend**: Azure App Service  
**Frontend**: Azure Static Web Apps  
**Database**: Azure SQL Database

```bash
# Deploy to Azure
az webapp up --name anansi-api --resource-group AnansiAI
```

### **🟠 AWS (Amazon)**

**Backend**: Elastic Beanstalk  
**Frontend**: S3 + CloudFront  
**Database**: RDS SQL Server

### **🟢 Google Cloud**

**Backend**: Cloud Run  
**Frontend**: Firebase Hosting  
**Database**: Cloud SQL

### **🟣 Heroku (Easiest)**

```bash
# Deploy backend
git subtree push --prefix=AnansiAI.Api heroku main

# Deploy frontend
npm run build
# Upload dist/ to Netlify or Vercel
```

---

## **🐳 Docker Deployment**

```bash
# Run the deployment script and choose option 2
./deploy-production.sh

# Then deploy with Docker
cd deployment-package
docker-compose up -d
```

---

## **⚡ Super Quick Deploy (5 minutes)**

### **1. 🌐 Frontend → Netlify**

1. Push your code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables from `.env.production`

### **2. 🖥️ Backend → Railway**

1. Push your code to GitHub
2. Connect repository to Railway
3. Select root directory: `AnansiAI.Api`
4. Add environment variables from `appsettings.Production.json`

### **3. 🗄️ Database → PlanetScale**

1. Create PlanetScale account
2. Create new database
3. Update connection string
4. Run migrations

**Total time: ~5 minutes** ⏱️

---

## **🔧 Configuration Quick Reference**

### **Must Update Before Deploy:**

1. **Database Connection**: Update in `appsettings.Production.json`
2. **JWT Secret**: Generate new 32+ character key
3. **API URL**: Update `VITE_API_URL` in `.env.production`
4. **CORS Origins**: Add your production domain

### **Security Checklist:**

- [ ] ✅ HTTPS enabled
- [ ] ✅ Strong passwords
- [ ] ✅ JWT secrets changed
- [ ] ✅ Database user (not admin)
- [ ] ✅ CORS properly configured

---

## **🚨 Production URLs Structure**

```
Frontend:  https://anansi-ai.com
API:       https://api.anansi-ai.com
Admin:     https://anansi-ai.com/super-admin-login
Database:  Your secured SQL Server
```

---

## **📊 After Deployment**

### **Test These URLs:**

1. `https://your-domain.com` - Frontend loads
2. `https://your-api.com/health` - API health check
3. `https://your-api.com/swagger` - API documentation
4. Login functionality works

### **Monitor:**

- Application logs
- Database performance
- User registrations
- System resources

---

## **🆘 Need Help?**

**Frontend Issues**: Check browser console and network tab  
**Backend Issues**: Check application logs in `logs/` folder  
**Database Issues**: Verify connection string and credentials

---

## **🎉 You're Live!**

Your **AnansiAI Educational Platform** is now serving real users with:

✅ **School Management System**  
✅ **Student & Teacher Dashboards**  
✅ **AI-Powered Insights**  
✅ **Real-time Analytics**  
✅ **Secure Authentication**  
✅ **Mobile-Responsive Design**

**Welcome to production! 🇰🇪 🚀**
