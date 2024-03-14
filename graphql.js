const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();

// Define GraphQL schema
const schema = buildSchema(`
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  type Query {
    book(id: ID!): Book
    books: [Book]
  }

 type Mutation {
    createBook(title: String!, author: String!): Book
    updateBook(id: ID!, title: String!, author: String!): Book
    deleteBook(id: ID!): String
  }
`);

// Define GraphQL resolvers
const root = {
  book: ({ id }) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        if (results.length === 0) {
          resolve(null);
          return;
        }
        resolve(results[0]);
      });
    });
  },
  books: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM books', (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  },
  createBook: ({ title, author }) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO books (title, author) VALUES (?, ?)', [title, author], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: results.insertId, title, author });
      });
    });
  },
  updateBook: ({ id, title, author }) => {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE books SET title = ?, author = ? WHERE id = ?', [title, author, id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id, title, author });
      });
    });
  },
  deleteBook: ({ id }) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM books WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve('Book deleted successfully');
      });
    });
  },
};

// Set up GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphql: true,
}));

const port = 4400;
app.listen(port, () => {
  console.log(`GraphQL server running at http://localhost:${port}/graphql`);
});
