import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../database/schemas/user.schema.js";
import { errorStatusCode } from "../constants/object.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token)
      throw new ApiError(errorStatusCode.Unauthorized, "Unauthorized request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password");
    if (!user)
      throw new ApiError(errorStatusCode.Unauthorized, "Invalid access token");

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};
