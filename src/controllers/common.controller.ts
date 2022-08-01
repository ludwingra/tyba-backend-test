import { Request, Response } from "express";
import axios from "axios";
import * as jwt from "jsonwebtoken";
import _ from "underscore";

import { Common } from "../helper/common";
import UsersModel from "../models/users.model";
import TransactionsModel from '../models/transactions.model';

export class CommonController {

  /**
   * Get all users
   * @param req 
   * @param res 
   * @param next 
   */
  async getAll(req: Request, res: Response, next: any) {
    try {
      // Parameters pagination
      let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let offset = (page - 1) * limit;

      // Query
      const results = await UsersModel().findAndCountAll({
        limit,
        offset
      });
       // Prepare response data
      let rpt = {
        data: results.rows,
        meta: {
          total: results.count,
          page
        }
      }
      // Response
      res.header({
        'x-total-count': results.count, 'access-control-expose-headers':'X-Total-Count' 
      }).json({...rpt});
    } catch (error) {
      // Log error
      new Common().showLogMessage('Controlled bug', error, 'error');
      // middleware log error
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }

  /**
   * get user by id
   * @param req 
   * @param res 
   * @param next 
   */
  async getById(req: Request, res: Response, next: any) {
    try {

      const { id } = req.params;
      const reg = await UsersModel().findByPk(id);

      if (!reg) {
        res.status(404).json({
          message: `The requested resource with the id cannot be found ${id}`,
          error: 'Not found',
          code: 40
        })
      }

      res.json(reg);

    } catch (error) {
      new Common().showLogMessage('Controlled bug', error, 'error');
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }

  /**
   * Create user
   * @param req 
   * @param res 
   * @param next 
   */
  async add(req: Request, res: Response, next: any) {

    const { body } = req;

    try {

      const reg = await UsersModel().create(body);
      res.json(reg);

    } catch (error) {
      new Common().showLogMessage('Controlled bug', error, 'error');
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }

  /**
   * Update user
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async update(req: Request, res: Response, next: any) {

    const { id } = req.params;
    const { body } = req;

    try {

      const reg = await UsersModel().findByPk(id);
      if (!reg) {
        return res.status(404).json({
          message: `The requested resource with the id cannot be found ${id}`,
          error: 'Not found',
          code: 40
        });
      }

      delete body.createdAt;
      delete body.updatedAt;
      
      await reg.update(body, {
        where: {
          id
        }
      });

      res.json(reg);

    } catch (error) {
      new Common().showLogMessage('Controlled bug', error, 'error');
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }

  }

  /**
   * Delete user
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async delete(req: Request, res: Response, next: any) {

    const { id } = req.params;

    try {

      const reg = await UsersModel().findByPk(id);
      if (!reg) {
        return res.status(404).json({
          message: `The requested resource with the id cannot be found ${id}`,
          error: 'Not found',
          code: 40
        });
      }

      // Eliminación fisica
      await reg.destroy();

      res.json({
        message: `The record with the ID ${id} has been deleted`
      })

    } catch (error) {
      new Common().showLogMessage('Controlled bug', error, 'error');
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }

  /**
   * Search restaurant
   * @param req 
   * @param res 
   * @param next 
   */
  async searchRestaurant(req: Request, res: Response, next: any){
    try {
      const { body } = req;
      const apiKey = process.env.GOOGLE_API_ID;
      const location = `${body.city}%20${body.country}`;
      const url: string = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurantes%20en%20${location}&key=${apiKey}`;
      const requestSearchGoogle: any = await axios.get(url);
      const infoToken: any =  jwt.decode((req.headers.authorization) as any);

      await TransactionsModel().create({
        user_id: infoToken.id,
        type: 'query',
        value: `restaurantes en ${body.city} ${body.country}`,
      })

      res.json(requestSearchGoogle.data.results)

    } catch (error) {
      new Common().showLogMessage('Controlled bug', error, 'error');
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }

  /**
   * Get all users
   * @param req 
   * @param res 
   * @param next 
   */
   async getAllTransactions(req: Request, res: Response, next: any) {
    try {
      // Parameters pagination
      let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let offset = (page - 1) * limit;

      // Query
      const results = await TransactionsModel().findAndCountAll({
        limit,
        offset,
        attributes: ['id','type', 'value','created_at'],
        include: [{
          model: UsersModel(),
          as: 'transaction_users',
          attributes: ['id','email','name']
        }],
      });
       // Prepare response data
      let rpt = {
        data: results.rows,
        meta: {
          total: results.count,
          page
        }
      }
      // Response
      res.header({
        'x-total-count': results.count, 'access-control-expose-headers':'X-Total-Count' 
      }).json({...rpt});
    } catch (error) {
      // Log error
      new Common().showLogMessage('Controlled bug', error, 'error');
      // middleware log error
      next({
        message: 'An error has occurred in our system, please try again',
        error,
        code: 10
      });
    }
  }
  
}
