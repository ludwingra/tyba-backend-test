import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Sequelize, Transaction } from "sequelize";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { Connection } from "../db/connection";
import { Common } from "../helper/common";
import UsersModel from "../models/users.model";

export class LoginController {

  /**
   * Login
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public login = async (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    try {

      // Get user data
      let user: any = await UsersModel().findOne({
        where: {
          email: req.body.email
        }
      });

      // If the user does not exist
      if (!user) {
        throw { message: '¡Invalid credentials!', error: 'Invalid credentials', code: 20 };
      }

      let compare = bcrypt.compareSync(req.body.password, user.password);

      // If the user does not exist
      if (!compare) {
        throw { message: '¡Invalid credentials!', error: 'Invalid credentials', code: 20 };
      }

      // Generate login token
      let token = await this.generateToken(user);

      // The response is returned
      res.header({ 'Authorization': token }).json({
        status: 'OK',
        user: {
          email: user.email,
          name: user.name,
          country: user.countries_id,
        }
      });
    } catch (error: any) {
      new Common().showLogMessage('Controlled bug', error, 'error');

      // Si hay error
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'An error has occurred in our system, please try again',
          error, code: 10
        });
    }
  }

  /**
   * Logup
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public logup = async (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    var transaction: Transaction;

    try {

      // Get user data
      let user: any = await UsersModel().findOne({
        where: {
          email: req.body.email
        }
      });

      // If the user does not exist
      if (user && user.id) {
        throw { message: '¡El usuario ya existe!', error: true, code: 30 };
      }

      // Start a transaction
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      let salt = bcrypt.genSaltSync(10);
      let pass = bcrypt.hashSync(req.body.password, salt);

      // Create the user
      let _user: any = await UsersModel().create({
        ...body,
        password: pass,
      }, { transaction });

      // Generate login token
      let token = await this.generateToken(_user);
      // Commit to changes
      await transaction.commit();

      // The response is returned
      res.header({ 'Authorization': token }).json({
        status: 'OK',
        user: {
          email: _user.email,
          name: _user.name,
          country: body.countries_id,
        }
      });
    } catch (error: any) {

      // Rollback to changes
      if (transaction!) await transaction!.rollback().catch(e => null);

      new Common().showLogMessage('Controlled bug', error, 'error');

      // If there is mistake
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'An error has occurred in our system, please try again',
          error, code: 10
        });
    }
  }

  /**
   * Password reset
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public resetPassword = async (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    const id = (req as any).user.iti;
    const body = req.body;

    try {

      let reg = await UsersModel().findByPk(id);

      if (!reg) {
        return res.status(404).json({
          code: 40,
          message: `The requested resource with the id cannot be found ${id}`
        });
      }

      let salt = bcrypt.genSaltSync(10);
      body.password = bcrypt.hashSync(body.password, salt);

      await reg.update(body, {
        where: {
          id
        }
      });

      res.json({ response: reg, status: 'OK' });

    } catch (error: any) {
      new Common().showLogMessage('Controlled bug', error, 'error');

      // Si hay error
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'An error has occurred in our system, please try again',
          error, code: 10
        });
    }
  }

  /**
   * Generate JWT token
   * @param user 
   * @param expireMinutes ?
   * @param expire ?
   * @returns 
   */
  public generateToken(user: any, expireMinutes?: number, expire: number = 30) {
    return new Promise((resolve, reject) => {
      try {
        const privateKey: any = process.env.TYBA_SECRET_JWT_KEY;

        let token = jwt.sign({
          "id": user.id,
          "name": user.name,
          "email": user.email,
        },
          privateKey, {
          algorithm: "HS256",
          expiresIn: !expireMinutes ? 3600 * 24 * expire : expireMinutes * 60
        });
        resolve(token);
      } catch (error) {
        reject(`Error generating the token ${error}`);
      }
    })
  }
}