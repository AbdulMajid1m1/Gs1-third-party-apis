import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path"
import rootRoute from "./router/rootRoute.js";
const app = express();
const corsOptions = {
  exposedHeaders: ['Content-Length', 'Authorization'],
  origin: true,
  credentials: true
};
app.use(cors(corsOptions));


app.use(cookieParser());
const uploadFolder = path.join(process.cwd(), "uploads"); // get the absolute path to the uploads folder
app.use("/uploads", express.static(uploadFolder));
app.use(express.json());
app.use(express.urlencoded({ extended: true })) //Parse URL-encoded bodies
const PORT = process.env.PORT || 7000;

app.use("/api", rootRoute)
const server = app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});

// Set the timeout to 2 minutes (120000 milliseconds) 

server.timeout = 120000;

