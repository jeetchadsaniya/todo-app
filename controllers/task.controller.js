import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Task } from "../database/schemas/task.schema.js";
import validator from "validator";
import { errorStatusCode, resSuccess } from "../constants/object.js";

const createTodo = async (req, res) => {
  try {
    const { title, description, status } = req.body ?? {};

    if (!title || !description)
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Title and description are required"
      );

    if (!validator.isLength(title, { min: 5, max: 30 }))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Title must be between 5 and 30 characters"
      );

    if (!validator.isLength(description, { min: 10, max: 500 }))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Description must be between 10 and 500 characters"
      );

    if (status && !["completed", "incompleted"].includes(status))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Status must be either completed or 'incompleted "
      );

    const existingTodo = await Task.findOne({
      title: title.trim(),
      userId: req.user._id,
    });

    if (existingTodo)
      throw new ApiError(
        errorStatusCode.Conflict,
        "A todo with this title already exists"
      );

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      status: status || "incompleted",
      userId: req.user._id,
    });

    return res.status(resSuccess.Created).json(
      new ApiResponse(
        resSuccess.Created,
        {
          task,
        },
        "Todo created successfully"
      )
    );
  } catch (error) {
    console.log("Create todo error : ", error);
    res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const getAllTodos = async (req, res) => {
  try {
    const todos = await Task.find({ userId: req.user._id }).sort({ _id: -1 });

    return res.status(resSuccess.OK).json(
      new ApiResponse(
        resSuccess.OK,
        {
          count: todos.length,
          todos,
        },
        "Todos retrieved successfully"
      )
    );
  } catch (error) {
    console.log("Get all todos error : ", error);
    res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      throw new ApiError(errorStatusCode.BadRequest, "Todo ID is required");
    if (!validator.isMongoId(id))
      throw new ApiError(errorStatusCode.BadRequest, "Invalid todo ID format");

    const todo = await Task.findOne({ _id: id, userId: req.user._id });
    if (!todo) throw new ApiError(errorStatusCode.NotFound, "Todo not found");

    return res.status(resSuccess.OK).json(
      new ApiResponse(
        resSuccess.OK,
        {
          todo,
        },
        "Todo retrieved successfully"
      )
    );
  } catch (error) {
    console.log("Get todo error : ", error);
    res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body ?? {};

    if (!id)
      throw new ApiError(errorStatusCode.BadRequest, "Todo ID is required");
    if (!validator.isMongoId(id))
      throw new ApiError(errorStatusCode.BadRequest, "Invalid todo ID format");

    const existingTodo = await Task.findOne({ _id: id, userId: req.user._id });
    if (!existingTodo)
      throw new ApiError(errorStatusCode.NotFound, "Todo not found");

    if (title) {
      if (!title.trim())
        throw new ApiError(errorStatusCode.BadRequest, "Title cannot be empty");

      if (!validator.isLength(title, { min: 5, max: 30 }))
        throw new ApiError(
          errorStatusCode.BadRequest,
          "Title must be between 5 and 30 characters"
        );

      const duplicateTodo = await Task.findOne({
        title: title.trim(),
        userId: req.user._id,
        _id: { $ne: id },
      });

      if (duplicateTodo)
        throw new ApiError(
          errorStatusCode.Conflict,
          "A todo with this title already exists"
        );
    }

    if (description) {
      if (!description.trim())
        throw new ApiError(
          errorStatusCode.BadRequest,
          "Description cannot be empty"
        );

      if (!validator.isLength(description, { min: 10, max: 500 }))
        throw new ApiError(
          errorStatusCode.BadRequest,
          "Description must be between 10 and 500 characters"
        );
    }

    if (status && !["completed", "incompleted"].includes(status))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Status must be either completed or incompleted"
      );

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (status) updateData.status = status;

    const updatedTodo = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(resSuccess.OK).json(
      new ApiResponse(
        resSuccess.OK,
        {
          todo: updatedTodo,
        },
        "Todo updated successfully"
      )
    );
  } catch (error) {
    console.log("Update todo error : ", error);
    res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      throw new ApiError(errorStatusCode.BadRequest, "Todo ID is required");
    if (!validator.isMongoId(id))
      throw new ApiError(errorStatusCode.BadRequest, "Invalid todo ID format");

    const existingTodo = await Task.findOne({ _id: id, userId: req.user._id });
    if (!existingTodo)
      throw new ApiError(errorStatusCode.NotFound, "Todo not found");

    await Task.findByIdAndDelete(id);
    return res
      .status(resSuccess.OK)
      .json(new ApiResponse(resSuccess.OK, {}, "Todo deleted successfully"));
  } catch (error) {
    console.log("Delete todo error : ", error);
    res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

export { createTodo, getAllTodos, getTodo, updateTodo, deleteTodo };
