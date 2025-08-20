import { Router } from "express";
import {
  createTodo,
  getAllTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTodo).get(getAllTodos);
router.route("/:id").put(updateTodo).get(getTodo).delete(deleteTodo);

export default router;
