const { ApolloServer } = require('apollo-server');

const { gql } = require('apollo-server');

module.exports = gql`
  type User {
    username: String!
    email: String
    token: String
    imageUrl: String
    createdAt: String!
    latestMessage: Message
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;
