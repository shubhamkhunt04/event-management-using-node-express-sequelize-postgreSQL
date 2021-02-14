const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models").User;
const { generateToken } = require("../util/generateToken");
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdatePasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
} = require("../util/validators/userValidator");
const { mailSender } = require("../util/mailSender");
const { Op } = require("sequelize");

module.exports = {
  async register(req, res) {
    let { username, email, password } = req.body;
    const { isValid, error } = await validateRegisterInput(
      username,
      email,
      password
    );
    if (isValid) {
      try {
        const userAlreadyExist = await User.findOne({ where: { email } });
        console.log(Boolean(userAlreadyExist));
        if (!Boolean(userAlreadyExist)) {
          // hash password and createa an auth token
          password = await bcrypt.hash(password, 12);

          const user = await User.create({ username, email, password });
          console.log(user);
          const token = generateToken(user);

          return res.json({
            payload: { user, token },
            message: "User register successfully",
          });
        }

        return res.json({ message: "User Already Exist" });
      } catch (error) {
        console.log(error.message);
        return res.json({ message: "Something went wrong !" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    const { isValid, error } = await validateLoginInput(email, password);

    if (isValid) {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.json({ message: "Email or password is wrong !" });
        }
        const token = generateToken(user);

        return res.json({
          payload: { user, token },
          message: "User login successfully",
        });
      } catch (error) {
        return res.json({ message: "Something went wrong !" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async updatepassword(req, res) {
    const { oldPassword, newPassword } = req.body;

    const { isValid, error } = await validateUpdatePasswordInput(
      oldPassword,
      newPassword
    );

    if (isValid) {
      try {
        const { id } = req.decoded;
        if (id) {
          const user = await User.findByPk(id);
          if (user) {
            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) {
              return res.json({
                message: "Please enter currect oldPassword !",
              });
            }
            await user.update({
              password: await bcrypt.hash(newPassword, 12),
            });
            return res.json({ message: "Password updated successfully " });
          }
        }
      } catch (error) {
        console.log(error);
        return res.json({ message: "Something went wrong !" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async resetpassword(req, res) {
    const { email } = req.body;

    const { isValid, error } = await validateResetPasswordInput(email);
    if (isValid) {
      try {
        const user = await User.findOne({ where: { email } });
        if (user) {
          const token = crypto.randomBytes(20).toString("hex");
          await user.update({
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 60000,
          });
          await mailSender(email, token, user.dataValues.username);
          return res.json({
            message: "Reset password link send to on your register mail",
          });
        } else {
          return res.json({ message: "Email is not exist in database" });
        }
      } catch (error) {
        return res.json({ message: "Something went wrong" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async changePassword(req, res) {
    const { newPassword } = req.body;
    console.log(newPassword);
    const { isValid, error } = await validateChangePasswordInput(newPassword);
    if (isValid) {
      try {
        const user = await User.findOne({
          where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              [Op.gt]: String(Date.now()),
            },
          },
        });
        console.log(user);
        if (user) {
          await user.update({
            password: await bcrypt.hash(newPassword, 12),
          });
          console.log(user);
          return res.json({
            message: "Password reset sucessfully",
          });
        } else {
          return res.json({
            message: "You are not authorize to reset the password",
          });
        }
      } catch (error) {
        return res.json({ message: "Something went wrong" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },
};
