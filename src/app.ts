import { createServer, Server as HTTPServer } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import { Sequelize } from "sequelize";

import { Connection } from "./db/connection";
// Middlewares
import { ErrorMiddleware } from "./middleware/errorHandler";
import { NotFoundMiddleware } from "./middleware/notFoundHandler";
// Routes
import usersRoutes from "./routes/users.route";


export class App {

  private app: Application = express();
  private httpServer: HTTPServer = createServer(this.app);

  private initialize(): void {

    // Launch app setup
    this.initApp();
    this.configureRoutes();
    this.dbConnection();
    // Start the middlewares
    this.mountMiddlewares();
  }

  /**
   * Start the app
   */
  private initApp(): void {

    this.app.disable("x-powered-by");
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({
      exposedHeaders: ['Authorization', 'authorization', 'Content-Length'],
    }));

    // Set header responses
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });
  }

  async dbConnection() {
    try {
      await (Connection.getInstance().db as Sequelize).authenticate();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set header responses
   */
  private mountMiddlewares(): void {

    const errorMid = new ErrorMiddleware();
    const notFound = new NotFoundMiddleware();

    // 404
    this.app.use(notFound.notFountHandler);

    // Error handling
    this.app.use(errorMid.logErrors);
    this.app.use(errorMid.wrapErrors);
    this.app.use(errorMid.errorHandler);
  }

  /**
   * Start the routes
   */
  private configureRoutes(): void {
    this.app.use(`/${ process.env.BASE_PATH || 'tyba'}/api/users`, usersRoutes);
  }

  /**
   * Start the server listener
   * @param callback 
   */
  public listen(callback: (port: number) => void): void {
    let port = parseInt(process.env.PORT as any);
    this.httpServer.listen(port, () => {
      callback(port);
      this.initialize();
    });
  }
}