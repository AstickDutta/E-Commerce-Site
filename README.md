# titaniumaplus

## Apis

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


