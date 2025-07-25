import express from 'express'
import { PORT } from './config/env.js'
import routes from './routes/allRoutes.js';
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, 
  message: {
    success: false,
    message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde",
  },
});

app.use(helmet());
app.use(cors());
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
//Rutas de la api
app.use('/api', routes);

//Ruta main
app.get("/", (req, res) => {
    res.send('❤️ API Peliculas en línea');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
});