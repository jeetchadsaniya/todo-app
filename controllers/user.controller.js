import { COOKIE_EXPIRY } from "../constants/string.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../database/schemas/user.schema.js";
import validator from "validator";
import { errorStatusCode, resSuccess } from "../constants/object.js";

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body ?? {};
    if (!fullName || !email || !password)
      throw new ApiError(errorStatusCode.BadRequest, "All fields are required");

    if (!validator.isEmail(email))
      throw new ApiError(errorStatusCode.BadRequest, "Invalid email format");

    if (
      !validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    )
      throw new ApiError(errorStatusCode.BadRequest, "Provide strong password");

    if (!validator.isLength(fullName.trim(), { min: 3 }))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Full name must be at least 3 characters long"
      );

    const nameWithoutSpaces = fullName.replaceAll(" ", "");
    if (!validator.isAlpha(nameWithoutSpaces))
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Full name must contain only letters and spaces"
      );

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      throw new ApiError(errorStatusCode.Conflict, "Email already in use");

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
    });

    return res.status(resSuccess.Created).json(
      new ApiResponse(
        resSuccess.Created,
        {
          user: { _id: user._id, fullName: user.fullName },
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    console.log("Register error : ", error);
    return res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password)
      throw new ApiError(
        errorStatusCode.BadRequest,
        "Email and password are required"
      );

    if (!validator.isEmail(email))
      throw new ApiError(errorStatusCode.BadRequest, "Invalid email format");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      throw new ApiError(
        errorStatusCode.Unauthorized,
        "Please register first.."
      );

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid)
      throw new ApiError(errorStatusCode.Unauthorized, "Invalid password");

    const accessToken = user.generateAccessToken();

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: COOKIE_EXPIRY,
    };

    return res
      .status(resSuccess.OK)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          resSuccess.OK,
          {
            accessToken,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.log("Login error : ", error);
    return res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

const logOutUser = async (_, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(resSuccess.OK)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(resSuccess.OK, {}, "User logged out successfully"));
  } catch (error) {
    console.log("Logout error:", error);
    return res
      .status(error?.statusCode ?? errorStatusCode.InternalServerError)
      .json(error);
  }
};

export { registerUser, loginUser, logOutUser };
