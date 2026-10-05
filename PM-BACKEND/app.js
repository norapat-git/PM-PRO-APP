
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const cors = require("cors");

var app = express();
const http = require('http');
const https = require('https');
const WebSocket = require('ws');

require("dotenv").config();

app.set('trust proxy', true);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

'use strict';
Error.stackTraceLimit = 50;

//enable cros
var corsOptions = { origin: "*", credentials: true };
app.use(cors(corsOptions));
app.use(cors({ origin: ["http://localhost"], credentials: true }))
app.use(cors({ origin: ["https://uat3.ru.ac.th"], credentials: true }))
app.use(cors({
  origin: "*", credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors()); // ให้ OPTIONS ผ่าน
app.use(helmet());

/* const allowedOrigins = [
  'http://localhost:4200',
  'https://uat3.ru.ac.th'
];

app.use(cors({
  origin: function (origin, callback) {

    // allow requests with no origin (mobile apps, postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
})); */



const routeControll = require("./routers/routesControl");
const routes = require("./routers/routes"); 
const routes_frontend = require("./routers/frontend-route"); 
const pmRoutes = require("./routers/pmRoutes");

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'PM-PRO Enterprise Service & Maintenance API',
    version: '2.0.0',
    database: 'Supabase PostgreSQL',
    endpoints: {
      tickets: '/api/tickets',
      service_reports: '/api/reports',
      machines: '/api/machines',
      factories: '/api/factories',
      pm_schedules: '/api/pm-schedules',
      spare_parts: '/api/spare-parts',
      quotations: '/api/quotations'
    }
  });
});

// PM-PRO Core Routes
app.use('/api', pmRoutes);
app.use('/api/pm', pmRoutes);

// Legacy routes preserved
app.use('/api/doc', routes);
app.use('/api/', routeControll);
app.use('/api/service/frontend', routes_frontend); 
app.use('/api/service', routes); 

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
server.keepAliveTimeout = 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`[PM-PRO API] Server listening on http://localhost:${port}`);
});
