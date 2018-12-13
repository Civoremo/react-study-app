# Table schemas

## Users
POST `/api/auth/register`  
POST `/api/auth/login`  

| Field    | Data Type                     |
| -------- | ----------------------------- |
| id       | Unsigned Int (auto increment) |
| email    | String (unique) (required)    |
| username | String (unique) (required)    |
| password | String (required)             |
| img_url  | String                        |

## Questions

GET `/api/quizzes/:quizId/questions`  
GET `/api/quizzes/:quizId/questions/:questionId`  
POST `/api/quizzes/:quizId/questions` REQUIRES AUTH  
PATCH `/api/quizzes/:quizId/questions/:questionId/edit` REQUIRES AUTH  
PATCH `/api/quizzes/:quizId/questions/:questionId` (receives whether answer is correct or not)  
DELETE `/api/quizzes/:quizId/questions/:questionId` REQUIRES AUTH  

| Field    | Data Type                     |
| -------- | ----------------------------- |
| id       | Unsigned Int (auto increment) |
| question | String (required)             |
| option1  | String (required)             |
| option2  | String (required)             |
| option3  | String                        |
| option4  | String                        |
| answer   | Unsigned Int (1-4)            |
| author   | Unsigned Int (ref to users)   |
| quiz_id  | Unsigned Int (ref to quizzes) |

## Quizzes

GET `/api/quizzes`  
GET `/api/quizzes/:quizId`  
POST `/api/quizzes/` REQUIRES AUTH  
PATCH `/api/quizzes/:quizId/edit` REQUIRES AUTH  
PATCH `/api/quizzes/:quizId` REQUIRES AUTH (but can be any user, updates quiz/user relationship)  
DELETE `/api/quizzes/:quizId` REQUIRES AUTH   


| Field              | Data Type                     |
| ------------------ | ----------------------------- |
| id                 | Unsigned Int (auto increment) |
| title              | String (required)             |
| author             | Unsigned Int (ref to users)   |
| time_limit_seconds | Unsigned Int                  |
| votes              | Int (default: 0)              |
| topic_id              | Unsigned Int (ref to topics)  |

## Topics

GET `/api/quizzes/topics`  

| Field       | Data Type                     |
| ----------- | ----------------------------- |
| id          | Unsigned Int (auto increment) |
| name        | String (required)             |

## User-Quizzes

| Field       | Data Type                      |
| ----------- | ------------------------------ |
| id          | Unsigned Int (auto increment)  |
| quiz_id     | Unsigned Int (ref to quizzes)  |
| user_id     | Unsigned Int (ref to users)    |
| vote        | Int (default: 0) (-1 || 1)     |    
| favorite    | Bool (default: false)          |
| score       | Unsigned Int(default: 0)       |           


## Posts

GET `/api/posts`   
GET `/api/posts/:postId`  
POST `/api/posts` REQUIRES AUTH  
PATCH `/api/posts/:postId` REQUIRES AUTH  
DELETE `/api/posts/:postId` REQUIRES AUTH  

| Field      | Data Type                     |
| ---------- | ----------------------------- |
| id         | Unsigned Int (auto increment) |
| title      | String (required)             |
| body       | Text (required)               |
| author     | Unsigned Int (ref to users)   |
| created_at | Timestamp (default: Date.now) |

## Comments

GET `/api/posts/:postId/comments`   
GET `/api/posts/:postId/comments/:commentId`  
POST `/api/posts/:postId/comments` REQUIRES AUTH  
PATCH `/api/posts/:postId/comments/:commentId` REQUIRES AUTH  
DELETE `/api/posts/:postId/comments/:commentId` REQUIRES AUTH  

| Field        | Data Type                     |
| ------------ | ----------------------------- |
| id           | Unsigned Int (auto increment) |
| text         | Text (required)               |
| author       | Unsigned Int (ref to users)   |
| post_id      | Unsigned Int (ref to posts)   |
| created_at   | Timestamp (default: Date.now) |

**STRETCH GOALS**

## Friends

| Field  | Data Type                      |
| ------ | ------------------------------ |
| id     | Unsigned Int (auto increments) |
| user_1 | Unsigned Int (ref to users)    |
| user_2 | Unsigned Int (ref to users)    |

## Direct-Messages

| Field      | Data Type                      |
| ---------- | ------------------------------ |
| id         | Unsigned Int (auto increments) |
| from       | Unsinged Int (ref to users)    |
| to         | Unsinged Int (ref to users)    |
| message    | Text (required)                |
| created_at | Timestamp (default: Date.now)  |

_If you feel ambitious allow to field to have multiple recpients, need another
table for that_

## Leaderboards

Don't really need another table, can be generated in the backend with existing
data. Run a query to aggregate all quiz scores user-wise quiz-wise, sort it by
scores and send back.

- Quiz leader: Highest points quiz-wise
- Global leader: Combined leader with points from all quizzes
- Monthly leader(Quiz, Global): For each month

## Image Uploads

Add another field in users table `image_url` of `string` type. Use `multer` to
receive `multipart/form-data`, store the file either locally or use cloudinary,
get the url and store it in the users table.
