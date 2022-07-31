import { Router } from "express";
import { check } from "express-validator";

import { UserController } from "../controllers/users.controller";
import { LoginController } from '../controllers/login.controller';
import { AuthMiddleware } from '../middleware/auth';
import { AuthorizationMiddleware } from '../middleware/authorization';

const router = Router();
const userController = new UserController();
const loginController = new LoginController();
const authMiddleware = new AuthMiddleware(); 

router.get('/', [ authMiddleware.auth ],userController.getAll)
router.get('/:id', [ authMiddleware.auth ],userController.getById)
router.post('/', [ 
  authMiddleware.auth,
  check('email').not().isEmpty().exists().withMessage("Email is required"),
  check('password').not().isEmpty().exists().withMessage("Password is required"),
  check('name').not().isEmpty().exists().withMessage("Name is required"),
],userController.add)
router.put('/:id', [ authMiddleware.auth ],userController.update)
router.delete('/:id', [ authMiddleware.auth ],userController.delete)
router.post('/login', [
  check('email').not().isEmpty().exists().withMessage("Email is required"),
  check('password').not().isEmpty().exists().withMessage("Password is required"),
], loginController.login)
router.post('/signup', [
  check('email').not().isEmpty().exists().withMessage("Email is required"),
  check('password').not().isEmpty().exists().withMessage("Password is required"),
  check('name').not().isEmpty().exists().withMessage("Name is required"),
], loginController.signup)
router.put('/auth/password-update', [
  authMiddleware.auth,
  check('password').not().isEmpty().exists().withMessage("El password es requerido"),
], loginController.resetPassword)

export default router;