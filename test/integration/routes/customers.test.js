//GET
//should return all the customers

//GET /:id
//should return 404 if invalid id is passed
//should return 404 if customer with the given id is not found
//should return a customer if valid id is passed

//POST
//should return 401 if client is not logged in
//should return 400 if name is under 5 characters
//should return 400 if name is over 50 characters
//should return 400 if phone is under 9 characters
//should return 400 if phone is over 15 characters
//should return 400 if phone isn't a numeric string
//should save customer if if is valid
//should return customer if it is valid

//PUT
//should return 401 if client is not logged in
//should return 404 if invalid id is passed
//should return 400 if name is under 5 characters
//should return 400 if name is over 50 characters
//should return 400 if phone is under 9 characters
//should return 400 if phone is over 15 characters
//should return 400 if phone isn't a numeric string
//should return 404 if no customer with the given id was found
//should save customer if it is valid
//should return customer if it is valid

//DELETE
//should return 401 if client is not logged in
//should return 403 if client is not admin
//should return 404 if invalid id is passed
//should return 404 if no customer with the given id was found
//should delete customer if is valid
//should return the customer if is valid
