const { Category } = require('./models/category');
const { Author } = require('./models/author');
const { Publisher } = require('./models/publisher');
const { Book } = require('./models/book');

const mongoose = require('mongoose');
const config = require('config');

const categoriesData = [
  { name: 'Philosophy' },
  { name: 'Politics' },
  { name: 'Journalism' },
];

const authorData = [
  { firstName: 'Karl', lastName: 'Popper' },
  { firstName: 'Hannah', lastName: 'Arendt' },
  { firstName: 'Carl', lastName: 'Schmitt' },
  { firstName: 'Chantal', lastName: 'Mouffe' },
];

const publishersData = [
  { name: 'Routledge' },
  { name: 'Taylor & Francis' },
  { name: 'Penguin Classics' },
];

const booksData = [
  {
    title: 'The Open Society and Its Enemies',
    author: {
      firstName: 'Karl',
      lastName: 'Popper',
    },
    category: { name: 'Philosophy' },
    publisher: { name: 'Routledge' },
    stock: 6,
    availableBooks: 5,
  },
  {
    title: 'Eichmann in Jerusalem',
    author: {
      firstName: 'Hannah',
      lastName: 'Arendt',
    },
    category: { name: 'Journalism' },
    publisher: { name: 'Penguin Classics' },
    stock: 5,
    availableBooks: 5,
  },
  {
    title: 'The Concept of the Political',
    author: {
      firstName: 'Carl',
      lastName: 'Schmitt',
    },
    category: { name: 'Politics' },
    publisher: { name: 'Routledge' },
    stock: 10,
    availableBooks: 4,
  },
  {
    title: 'All Life is Problem Solving',
    author: {
      firstName: 'Karl',
      lastName: 'Popper',
    },
    category: { name: 'Philosophy' },
    publisher: { name: 'Penguin Classics' },
    stock: 5,
    availableBooks: 1,
  },
  {
    title: 'Love and Saint Augustine',
    author: {
      firstName: 'Hannah',
      lastName: 'Arendt',
    },
    category: { name: 'Journalism' },
    publisher: { name: 'Taylor & Francis' },
    stock: 5,
    availableBooks: 5,
  },
  {
    title: 'Political Theology',
    author: {
      firstName: 'Carl',
      lastName: 'Schmitt',
    },
    category: { name: 'Politics' },
    publisher: { name: 'Taylor & Francis' },
    stock: 15,
    availableBooks: 15,
  },
  {
    title: 'The Challenge of Carl Schmitt',
    author: {
      firstName: 'Chantal',
      lastName: 'Mouffe',
    },
    category: { name: 'Journalism' },
    publisher: { name: 'Taylor & Francis' },
    stock: 9,
    availableBooks: 6,
  },
  {
    title: 'The Democratic Paradox',
    author: {
      firstName: 'Chantal',
      lastName: 'Mouffe',
    },
    category: { name: 'Philosophy' },
    publisher: { name: 'Routledge' },
    stock: 6,
    availableBooks: 1,
  },
  {
    title: 'The Open Universe',
    author: {
      firstName: 'Karl',
      lastName: 'Popper',
    },
    category: { name: 'Philosophy' },
    publisher: { name: 'Routledge' },
    stock: 10,
    availableBooks: 10,
  },
];

async function seed() {
  await mongoose.connect(config.get('database'));

  await Category.deleteMany({});
  await Publisher.deleteMany({});
  await Author.deleteMany({});
  await Book.deleteMany({});

  await Category.insertMany(categoriesData);
  await Publisher.insertMany(publishersData);
  await Author.insertMany(authorData);

  const books = await Promise.all(
    booksData.map(async (book) => {
      const author = await getAuthorId(book.author.firstName);
      const category = await getCategoryId(book.category.name);
      const publisher = await getPublisherId(book.publisher.name);

      const newBook = {
        ...book,
        author: {
          _id: author._id,
          firstName: author.firstName,
          lastName: author.lastName,
        },
        category: { _id: category._id, name: category.name },
        publisher: { _id: publisher._id, name: publisher.name },
      };

      return newBook;
    })
  );

  console.log(books);

  await Book.insertMany(books);

  mongoose.disconnect();
  console.log('Seeded!');
}

async function getAuthorId(name) {
  return await Author.findOne({
    firstName: `${name}`,
  });
}
async function getCategoryId(name) {
  return await Category.findOne({
    name: `${name}`,
  });
}

async function getPublisherId(name) {
  return await Publisher.findOne({
    name: `${name}`,
  });
}

seed();
