# books-city

Simple RESTful API using Node.js, Express &amp; MongoDB

You can check it out at https://obscure-escarpment-61817.herokuapp.com/

Check out the gets at /api/:
- categories,
- authors,
- publishers,
- books,
- customers,
- lendings.

(example: https://obscure-escarpment-61817.herokuapp.com/api/categories)

also I use this API for my Books-City front end app ( https://books-city.herokuapp.com/books || repository: https://github.com/jjginga/books-city-frontend)

If you donwload the app don't forget that you need to set two enviroment variables: 
  - bookscity_database, (the uri to your mongodb database)
  - bookscity_jwtPrivateKey, (whatever you choose).

Also don't forget to check my tests "npm test"
