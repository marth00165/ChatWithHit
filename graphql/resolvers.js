const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server');
const { User } = require('../models');

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (e) {
        console.log(e);
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
