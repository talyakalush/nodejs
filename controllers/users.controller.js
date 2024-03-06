import {
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  patchIsBiz,
  getAllUsers,
  getUserById,
} from "../model/dbAdapter.js";
import handleError from "../utils/handleError.js";
import { generateHash, cmpHash } from "../utils/bcrypt.js";
import { generateToken } from "../token/jwt.js";
const getAllUsersController = async (req, res) => {
  try {
    let users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};
const registerController = async (req, res) => {
  try {
    let userFromDB = await getUserByEmail(req.body.email);

    if (userFromDB) throw new Error("user already exists");
    let passwordHash = await generateHash(req.body.password);

    req.body.password = passwordHash;

    let newUser = await createUser(req.body);
    newUser.password = undefined;
    delete newUser.password;

    res.json(newUser);
  } catch (err) {
    handleError(res, 400, err.message);
  }
};

const loginController = async (req, res) => {
  try {
    const email = req.body.email;
    let userFromDB = await getUserByEmail(email);

    if (!userFromDB) throw new Error("invalid email or password");

    if (userFromDB.loginAttempts && userFromDB.blockExpires > Date.now()) {
      throw new Error(
        "Too many failed login attempts. Please try again after 24 hours."
      );
    }

    let passwordMatch = await cmpHash(req.body.password, userFromDB.password);
    if (!passwordMatch) {
      userFromDB.loginAttempts = (userFromDB.loginAttempts || 0) + 1;
      if (userFromDB.loginAttempts >= 3) {
        userFromDB.blockExpires = Date.now() + 24 * 60 * 60 * 1000;
        userFromDB.loginAttempts = 0;
      }
      await userFromDB.save();
      throw new Error("invalid email or password");
    }

    if (userFromDB.loginAttempts > 0) {
      userFromDB.loginAttempts = 0;
      userFromDB.blockExpires = null;
      await userFromDB.save();
    }

    let token = await generateToken({
      _id: userFromDB._id,
      isAdmin: userFromDB.isAdmin,
      isBusiness: userFromDB.isBusiness,
    });
    res.json(token);
  } catch (err) {
    console.log(err);
    handleError(res, 400, err.message);
  }
};

const updateUserController = async (req, res) => {
  try {
    let userFromDB = await updateUser(req.params.id, req.body);
    userFromDB.password = undefined;
    res.json(userFromDB);
  } catch (err) {
    console.log(err);
    handleError(res, 400, err.message);
  }
};

const patchIsBizController = async (req, res) => {
  try {
    let userFromDB = await patchIsBiz(req.params.id, req.body.isBusiness);
    userFromDB.password = undefined;
    res.json(userFromDB);
  } catch (err) {
    console.log(err);
    handleError(res, 400, err.message);
  }
};

const deleteUserController = async (req, res) => {
  try {
    let userFromDB = await deleteUser(req.params.id);
    userFromDB.password = undefined;
    res.json(userFromDB);
  } catch (err) {
    console.log(err);
    handleError(res, 400, err.message);
  }
};
const getUserByIdController = async (req, res) => {
  try {
    let userFromDB = await getUserById(req.params.id);
    userFromDB.password = undefined;
    res.json(userFromDB);
  } catch (err) {
    console.log(err);
    handleError(res, 400, err.message);
  }
};

export {
  loginController,
  registerController,
  updateUserController,
  deleteUserController,
  patchIsBizController,
  getAllUsersController,
  getUserByIdController,
};
