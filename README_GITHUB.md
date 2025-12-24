# 🚚 NAK Logistics Dashboard

> **Enterprise logistics dashboard** with BigQuery integration. Available in both **Google Apps Script** and **standalone JavaScript** versions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![BigQuery](https://img.shields.io/badge/BigQuery-Integrated-blue)](https://cloud.google.com/bigquery)

---

## 📋 Overview

NAK Logistics Dashboard is a comprehensive business intelligence solution for logistics companies, featuring:

- 📊 **Real-time Analytics** - Overview metrics, revenue tracking, performance monitoring
- 🚚 **Fleet Management** - Vehicle performance tracking and optimization
- 👥 **Customer Analytics** - Top customers, revenue analysis
- 🛣️ **Route Intelligence** - Most profitable routes and route optimization
- 📈 **Interactive Charts** - Built with Apache ECharts
- 🔌 **Iframe Embeddable** - Seamlessly integrate into any website

---

## ✨ Features

### Dashboard Components

- **Overview Cards**
  - Total trips count
  - Active vehicles
  - Revenue tracking
  - Customer count

- **Performance Charts**
  - Top 10 customers by revenue
  - Top 10 routes by revenue
  - Top performing vehicles
  - Bottom performing vehicles (for optimization)

- **Accounting Module**
  - Customer reconciliation (Đối soát)
  - Trip reports
  - Revenue tracking by customer and route type

### Technical Features

- ✅ **Two Versions Available:**
  - Google Apps Script (original)
  - Standalone JavaScript (recommended for embedding)

- ✅ **Responsive Design** - Works on all devices
- ✅ **Demo Mode** - Test with sample data
- ✅ **BigQuery Integration** - Enterprise-grade data warehouse
- ✅ **Iframe Support** - Embed anywhere
- ✅ **Performance Optimized** - Caching, debouncing, batch updates

---

## 🚀 Quick Start

### Option 1: Standalone Version (Recommended)

```bash
# Navigate to standalone version
cd standalone

# Install dependencies
npm install

# Run in demo mode (no BigQuery required)
npm start
```

Open your browser: **http://localhost:3000**

### Option 2: Google Apps Script Version

1. Open [Google Apps Script](https://script.google.com/)
2. Create new project
3. Copy all `.gs` and `.html` files
4. Deploy as web app
5. Configure BigQuery connection

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📂 Project Structure

```
nak-logistics-dashboard/
├── standalone/                 # Standalone JavaScript version
│   ├── index.html             # Frontend (all-in-one, 43KB)
│   ├── server.js              # Backend API (Node.js + Express)
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── embed-example.html     # Iframe embedding example
│   ├── README.md              # Full documentation
│   ├── QUICKSTART.md          # 5-minute setup guide
│   └── START_HERE.txt         # Getting started
│
├── *.gs                       # Google Apps Script backend
├── *.html                     # GAS frontend components
├── MIGRATION_GUIDE.md         # GAS → Standalone migration
├── GITHUB_SETUP.md            # GitHub deployment guide
└── README.md                  # This file
```

---

## 🎯 Standalone Version Features

### Frontend (index.html)
- Single HTML file (43KB)
- 100% vanilla JavaScript
- No external dependencies except ECharts and Material Icons
- Responsive grid layout
- Dark/Light mode support

### Backend (server.js)
- Node.js + Express RESTful API
- BigQuery integration via `@google-cloud/bigquery`
- CORS enabled
- Environment variable configuration
- Error handling and logging

---

## 🔌 Iframe Embedding

### Basic Embedding

```html
<iframe
    src="http://localhost:3000/index.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: none; border-radius: 8px;"
></iframe>
```

### Responsive Embedding

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe
        src="http://your-domain.com/dashboard"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    ></iframe>
</div>
```

See [standalone/embed-example.html](standalone/embed-example.html) for a complete example.

---

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=3000
BIGQUERY_PROJECT_ID=your-project-id
BIGQUERY_DATASET=your-dataset
BIGQUERY_KEY_FILE=./service-account-key.json
```

### BigQuery Setup

1. Create a service account in Google Cloud Console
2. Grant BigQuery permissions (Data Viewer, Job User)
3. Download JSON key file
4. Place in `standalone/` directory as `service-account-key.json`

See [standalone/README.md](standalone/README.md) for detailed setup.

---

## 📊 API Endpoints

### Dashboard Data

```http
POST /api/dashboard/all
Content-Type: application/json

{
  "type": "day|week|month|year",
  "date": "YYYY-MM-DD"
}
```

### Accounting Module

```http
GET /api/ke-toan/customers
GET /api/ke-toan/route-types

POST /api/ke-toan/doi-soat
Content-Type: application/json

{
  "ma_khach_hang": "KH001",
  "loai_tuyen": "Nội tỉnh",
  "tu_ngay": "2024-01-01",
  "den_ngay": "2024-01-31"
}
```

See [server.js](standalone/server.js) for all available endpoints.

---

## 🚢 Deployment

### Deploy to VPS/Cloud Server

```bash
# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name nak-dashboard
pm2 save
pm2 startup
```

### Deploy to Cloud Platforms

**Google Cloud Run:**
```bash
gcloud run deploy nak-dashboard \
    --source . \
    --platform managed \
    --allow-unauthenticated
```

**Heroku:**
```bash
heroku create nak-dashboard
git push heroku main
```

See [standalone/README.md#deploy](standalone/README.md#-deploy-lên-production) for detailed deployment guides.

---

## 🎨 Screenshots

### Main Dashboard
![Dashboard Overview](https://via.placeholder.com/800x450?text=Dashboard+Overview)

### Analytics Charts
![Analytics](https://via.placeholder.com/800x450?text=Analytics+Charts)

### Accounting Module
![Accounting](https://via.placeholder.com/800x450?text=Accounting+Module)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](standalone/QUICKSTART.md) | 5-minute setup guide |
| [README.md](standalone/README.md) | Full standalone documentation |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | GAS to Standalone migration |
| [GITHUB_SETUP.md](GITHUB_SETUP.md) | GitHub deployment guide |
| [START_HERE.txt](standalone/START_HERE.txt) | Quick reference |

---

## 🔐 Security

### Important Notes

- ⚠️ **Never commit** `service-account-key.json`
- ⚠️ **Never commit** `.env` files
- ✅ Use HTTPS in production
- ✅ Configure CORS properly
- ✅ Implement rate limiting
- ✅ Validate all user inputs

Files are protected by `.gitignore`:

```gitignore
service-account-key.json
.env
node_modules/
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Troubleshooting

Common issues and solutions:

**"Module not found"**
```bash
npm install
```

**"Port 3000 already in use"**
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**"BigQuery permission denied"**
- Check service account has proper roles
- Verify `service-account-key.json` is correct
- Confirm project ID matches in `.env`

See [standalone/README.md#troubleshooting](standalone/README.md#-troubleshooting) for more.

---

## 📊 Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- [Apache ECharts](https://echarts.apache.org/) - Charts
- [Material Icons](https://fonts.google.com/icons) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography

### Backend
- [Node.js](https://nodejs.org/) - Runtime
- [Express](https://expressjs.com/) - Web framework
- [Google Cloud BigQuery](https://cloud.google.com/bigquery) - Data warehouse
- [@google-cloud/bigquery](https://www.npmjs.com/package/@google-cloud/bigquery) - BigQuery client

---

## 🎯 Roadmap

- [ ] Add more chart types (heatmaps, treemaps)
- [ ] Real-time updates via WebSockets
- [ ] Export to PDF/Excel
- [ ] User authentication system
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Dark mode toggle
- [ ] Advanced filtering options

---

## 👏 Acknowledgments

- Built with [Apache ECharts](https://echarts.apache.org/)
- Powered by [Google Cloud BigQuery](https://cloud.google.com/bigquery)
- Icons by [Material Design](https://material.io/design)

---

## 📞 Contact

For questions or support:

- 📧 Email: admin@allingo.vn
- 🌐 Website: [NAK Logistics](https://naklogistics.vn)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by NAK Logistics Team

</div>
