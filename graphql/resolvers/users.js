const bcrypt = require('bcryptjs');
const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User, Message } = require('../../models');
const { JWT_SECRET } = require('../../config/env.json');

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        let users = await User.findAll({
          attributes: ['username', 'imageUrl', 'createdAt'],
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [['createdAt', 'DESC']],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};
      try {
        if (username.trim() === '')
          errors.username = 'username must not be empty';
        if (password === '') errors.password = 'password must not be empty';

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors });
        }

        const user = await User.findOne({
          where: { username },
        });

        if (!user) {
          errors.username = 'user not found';
          throw new UserInputError('user not found', { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = 'password is incorrect';
          throw new UserInputError('password is incorrect', { errors });
        }

        const token = jwt.sign({ username }, JWT_SECRET, {
          expiresIn: '1h',
        });

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};

      try {
        if (email.trim() === '') errors.email = 'email must not be empty';
        if (username.trim() === '')
          errors.username = 'username must not be empty';
        if (password.trim() === '')
          errors.password = 'password must not be empty';
        if (confirmPassword.trim() === '')
          errors.confirmPassword = 'Confirm Password must not be empty';

        if (password !== confirmPassword)
          errors.confirmPassword =
            'Password and Confirm Password need to match';
        // const userByUserName = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });

        // if (userByUserName) errors.username = 'Username is taken';
        // if (userByEmail) errors.email = 'Email is taken';

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        password = await bcrypt.hash(password, 6);

        // TODO: Create User

        const user = await User.create({
          username,
          email,
          password,
        });

        return user;
      } catch (err) {
        console.log(err);
        if (err.name == 'SequelizeUniqueConstraintError') {
          err.errors.forEach(
            (e) =>
              (errors[`${e.path.split('.')[1]}`] = `${
                e.path.split('.')[1]
              } is already taken`)
          );
        } else if (err.name == 'SequelizeValidationError') {
          err.errors.forEach(
            (e) => (errors[`${e.path.split('.')[1]}`] = e.message)
          );
        }
        throw new UserInputError('Bad Input', { errors });
      }
    },
  },
};