# Database Documentation

This documentation guide details out the database technology used for this MCT application.

## Technology

**MongoDB** is a non-relational database program which is document-oriented, scalable, flexible, and widely used in development. For the purposes of this project, MongoDB allows the application to deal with unstructured data and supports horizontal scalability as the app grows in size.

Goals:

- Storage of commands sent to a satellite
- Storage of satellites used in the MCT application
- Storage of users

See [MongoDB's Documentation](https://www.mongodb.com/docs/) for more information.

## Schemas

### User Model

The User model records information about application administrators and satellite operators.

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

The Satellite model is used to store satellites that application administrators and operators will interface with.

| Field         | Type                |
| ------------- | ------------------- |
| id            | string              |
| name          | string              |
| intlCode      | string              |
| operators     | string[] of User id |
| validCommands | string[]            |
| createdAt     | Date                |
| updatedAt     | Date                |

### Schedule Model

The Schedule model is used to keep track of commands operators send to a satellite. Each schedule record will be associated with a satellite and the user who initiated the request.

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

The Log model is used to record response data from a scheduled request. Each log record will be associated with a satellite and a schedule.

| Field     | Type         |
| --------- | ------------ |
| id        | string       |
| data      | Object       |
| satellite | Satellite id |
| schedule  | Schedule id  |
| createdAt | Date         |
| updatedAt | Date         |
