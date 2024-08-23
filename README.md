# 🎬BoredTube
## Introduction

>🎬 **BoredTube** is a video sharing service similar to YouTube, with built-in Twitter-like features. This project provides a complete video management system. It includes user management, video upload and editing, tweet management, subscription management, playlist management, and more. Built with Node.js, Express.js, and MongoDB, BoredTube is strong and can grow easily. It connects with Cloudinary for storing media and uses JWT for secure login. With detailed API documentation and a focus on user experience, BoredTube aims to offer a smooth and efficient video management system.

## Important links
| Content           | Link                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| API Documentation | [click here](https://documenter.getpostman.com/view/36524668/2sA3s7ioWe)         |
| Data Model        | [click here ](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)              |

## Features

### User Management:

- Registration, login, logout, change password
- Profile management (avatar, cover image, other details)
- Watch history tracking and Clearing Watch History
- Liked videos tracking

### Video Management:

- Video upload
- Canceling Video upload with all resources cleaned up on backend.
- Visibility control (publish/un-publish)
- Video editing and deletion
- Video Search and pagination

### Tweet Management:

- Tweet creation and publishing
- Viewing user tweets
- Updating and deleting tweets
- Liking-disliking tweets

### Subscription Management:

- Subscribing to channels
- Viewing Channel subscriber
- Viewing Subscribed channel lists

### Playlist Management:

- Creating, updating, and deleting playlists
- Adding videos to playlists
- Removing videos from playlists and undoing them
- Viewing user playlists

### Like Management:

- Liking and Un-liking videos, comments, and tweets
- Viewing liked videos

### Comment Management:

- Adding, updating, and deleting comments on videos

### Dashboard:

- Viewing channel statistics (views, subscribers, videos, likes)
- Accessing uploaded videos and Controls
- Viewing Video statistics (PublishStatus, VideoName, DateUploaded, Views, TotalComments, LikeRatings)

### Health Check:

- Endpoint to verify the server's health

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Jest & Supertest
- Docker
- Github actions

## Installation and Setup

### Prerequisites

- Node.js (v20.x)
- Docker (optional, for containerized deployment)
- MongoDB (local or cloud instance)
- Cloudinary account (for media storage)

### Environment Variables

Create a `.env` file in the root directory of the project and populate it with the variables in `.env.sample` file.

### Installation

1) Clone the repository:

```
    git clone https://github.com/sujal-goswami/BoredTube.git
    cd boredtube
```

2) Install dependencies:

```
    npm install
```

### Running the Application
### Development

To run the application in development mode:
```
    npm run dev
```

### Production

To run the application in production mode:
```
    npm run start
```

### Running Tests
To run the tests:

```
    npm run test
```

### Docker Setup

To build and run the application using Docker:

1) Build the Docker image:

```
    docker build --target development -t boredtube:latest .
```

2) Run the Docker container:

```
    docker run -d --name boredtube -p 8000:8000 \
    -e PORT=8000 \
    -e MONGODB_URL=your_mongodb_url \
    -e CORS_ORIGIN=your_cors_origin \
    -e ACCESS_TOKEN_SECRET=your_access_token_secret \
    -e ACCESS_TOKEN_EXPIRY=your_access_token_expiry \
    -e REFRESH_TOKEN_SECRET=your_refresh_token_secret \
    -e REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry \
    -e CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name \
    -e CLOUDINARY_API_KEY=your_cloudinary_api_key \
    -e CLOUDINARY_API_SECRET=your_cloudinary_api_secret \
    boredtube:latest
```

### Continuous Integration and Deployment

This project uses GitHub Actions for CI/CD. The workflows are defined in the `.github/workflows` directory.

- Deploy Workflow 
- Test Workflow

## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request. Let's make 🎬BoredTube even better together! for more details refer [CONTRIBUTING.md](https://github.com/sujal-goswami/BoredTube/blob/main/CONTRIBUTING.md) .

## License
🎬BoredTube is licensed under the [MIT License](https://github.com/sujal-goswami/BoredTube/blob/main/LICENSE). Feel free to modify, distribute, and use the code for personal or commercial projects.
