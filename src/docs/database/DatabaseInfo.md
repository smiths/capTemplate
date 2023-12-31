# Database Documentation

This documentation guide details out the database technology used for this MCT application.

## Technology

**MongoDB** is a non-relational database program which is document-oriented, scalable, flexible, and widely used in development.

Goals:

- Storage of commands sent to a satellite
- Storage of satellites used in the MCT application
- Storage of users

See [MongoDB's Documentation](https://www.mongodb.com/docs/) for more information.

## Schemas

### User Model

UserRole: ‘OPERATOR’ | ‘ADMIN’

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | string                   |
| email      | string                   |
| role       | string                   |
| satellites | string[] of Satellite id |
| createdAt  | Date                     |
| updatedAt  | Date                     |

### Satellite Model

| Field         | Type                |
| ------------- | ------------------- |
| id            | string              |
| name          | string              |
| intlCode      | string              |
| operators     | string[] of User id |
| validCommands | string[]            |
| createdAt     | Date                |
| updatedAt     | Date                |

### User Model

ScheduleType: ‘LIVE’ | ‘FUTURE’

| Field              | Type         |
| ------------------ | ------------ |
| id                 | string       |
| commands           | string[]     |
| executionTimestamp | Date         |
| satellite          | Satellite id |
| requestType        | ScheduleType |
| status             | boolean      |
| user               | User id      |
| createdAt          | Date         |
| updatedAt          | Date         |

### Log Model

| Field     | Type         |
| --------- | ------------ |
| id        | string       |
| data      | Object       |
| satellite | Satellite id |
| schedule  | Schedule id  |
| createdAt | Date         |
| updatedAt | Date         |
