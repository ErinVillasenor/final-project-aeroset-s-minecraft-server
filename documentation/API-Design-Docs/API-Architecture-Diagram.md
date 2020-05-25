```
       +---------------------+               +---------------------+               +---------------------+
 REQ   |                     | REQ ->        |                     |Key ->         |                     |
-----> |    Authentication   |<------------->|     Rate Limiter    |<------------->|        Redis        |
       |                     |       <--Limit|                     |      <-- Value|                     |
       +---------------------+               +---------------------+               +---------------------+
           |      |      /|\
           |      |       |
           |      |       |                     Safety Query for Owner ID ->
           |      |       =-------------------------------------------------------------------=
           |      |                                       <- Result for Safety Query          |
           |      |                                                                          \|/
           |      |                          +---------------------+               +---------------------+
           |      |    REQ                   |                     |Query ->       |                     |
           |      =------------------------->|       Routes        |<------------->|    SQL Database     |
           |                                 |                     |     <- Results|                     |
           |ERR: Unauthorized                +---------------------+               +---------------------+
           |                                    |       |                                         
           |                                    |       |   File ID/Hash
           |                                    |       =-----------------=
           |                                    |RESPONSE                 |
           |                                    |                        \|/
           |                                    |               +---------------------+               +---------------------+
RESPONSE  \|/                                  \|/    <-RESPONSE|                     |Query->        |                     |
<----------=------------------------------------=---------------|     File Stream     |<------------->|  Large File Storage |
                                                                |                     |        <- Blob|      Database       |
                                                                +---------------------+               +---------------------+
```

# Architecture
Each section above represents a self-contained program that works upon the ExpressJS
middleware in different ways. All requests will proceed through Authentication before
reaching Routes. Authentication will also take care of Rate Limiting and using Redis.

## Application Boundries
As far as Docker is concerned, Node will load all of the following in one application.
- Authenticatin
- Rate Limiter
- Redis
- Routes
- File Stream

These will all be handled in NodeJS code. Each Block will be a seperate directory within the
"src/" directory within the repository. These will have directory names
matching the blocks in this diagram.


## Routes
Routes will be doing **a lot** of heavy lifting for the application. It will have to keep
track of all the routes, supporting all of the pipelining between valid requests. It will
also have to query for streamed files for the large file storage. Routes will be the
brain of the application. The other blocks are more for utility of the application.

## Authentication
The authentication block handles the "requests" first. It will then add to the request that
it has been authenticated. Otherwise, it will error out any request without authentication that
needs it. Routes should immediately throw out any requests that have not gone through 
authentication for security sake.

## File ID/Hash
The files (submissions) will be attached to the submission entity within the SQL database.
This will be done through a uniquely generated ID that is placed in the SQL database.

While the [SQL database does have a type for large files](https://dev.mysql.com/doc/refman/5.7/en/blob.html)
Instead, the data should be stored in a seperate instance. This might better fit
a Mongo Database instead since this was taught in class. In either case, the hash
would be the primary identifier to that second database where the large files
are stored. The hash could also include the size within the request (this can just 
be a function call).