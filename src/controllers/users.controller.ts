import { Request, Response } from "express";
import { Op } from "sequelize";
import moment from "moment";
import _ from "underscore";

import { Common } from "../helper/common";
import UsersModel from "../models/users.model";

export class UserController {

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
}
