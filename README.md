# titaniumaplus

## Movie Apis

### POST /movies
- Create a movie document from request body
- Make sure the name of the movie is both mandatory and unique
- The awards array is empty by default
- Return HTTP status 201 on a succesful movie creation. Also return the movie document. The response should be a JSON object like [this](#successful-response-structure) 

- Return HTTP status 400 for an invalid request with a response body like [this](#error-response-structure)

### GET /movies
- Returns all movies in the collection that aren't deleted
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 

### PUT /movies/:movieId
- Updates a movie by changing the imbd rating as well adding more cast members to the actors array
- Check if the movieId exists (must have isDeleted false). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure) 
- Return an HTTP status 200 if updated successfully with a body like [this](#successful-response-structure) 
- Also make sure in the response you return the updated movie document. 

### DELETE /movies/:movieId

- Check if the movieId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
- If the movie document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure) 

## User Apis

### POST /users
- Register a user 
- The details of a user are name(mandatory as well as unique), mobile(mandatory as well as unique), email(mandatory), password(mandatory) and a isDeleted flag with a default false value

### POST /login
- Validate credentials of the user and return a true status in response body. Also ensure the user is valid (not deleted) 
- return a token that should be used in subsequent requests to access/ modify user details. Thie token should be set in the response header (x-auth-token)

### GET /users/:userId
- Ensure a token is recieved in request header(x-auth-token). The token must be a valid JWT token.
- If the token is valid, ensure the user id present in the token matches with the user id recieved in the request (path param)
- return the user's details if the aforementioned conditions are met, else return a suitable HTTP status and message with a structure like [this](#error-response-structure) 

### PUT /users/:userId
- Ensure a token is recieved in request header(x-auth-token). The token must be a valid JWT token.
- If the token is valid, ensure the user id present in the token matches with the user id recieved in the request (path param)
- Update a user's mobile recieved in the request body if the aforementioned conditions are met, else return a suitable HTTP status and message with a structure like [this](#error-response-structure) 

### Successful Response structure
```yaml
{
  status: true,
  data: {

  }
}
```
### Error Response structure
```yaml
{
  status: false,
  msg: ""
}
```

## Collections
### Movies
```yaml
{
  "name": "The Shawshank Redemption",
  "imdbRating": 9.3,
  "director": "Frank Darabont",
  "actor": ["Tim Robbins", "Morgan Freeman"],
  "releaseYear": 1994,
  "awards": ["Oscars"]
}
```
### Users
```yaml
{
    "name" : "Sabiha",
    "mobile" : 9999999999,
    "email" : "s@gmail.com",
    "password" : "123",
    "isDeleted" : false,
}
```


