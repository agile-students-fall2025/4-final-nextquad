# NextQuad

## Product Vision Statement
NextQuad is a verified campus community platform that connects NYU students through study space discovery, event management, social feed, and marketplace features, all within a safe, authenticated environment for academic collaboration and campus life.

## Team Roles
**Developers**
- **[Polaris Wu](https://github.com/Polaris-Wu450)**
- **[Xiaohan Zhou](https://github.com/XiaohanZhou711)**
- **[Laura Liu](https://github.com/lauraliu518)**
- **[Milan Engineer](https://github.com/MilanEngineer)**
- **[Haroon Shafi](https://github.com/haroonshafi)**

**Sprint 0 Roles:**
- Scrum Master: [Polaris Wu](https://github.com/Polaris-Wu450)
- Product Owner: [Xiaohan Zhou](https://github.com/XiaohanZhou711)

**Sprint 1 Roles:**
- Scrum Master: [Polaris Wu](https://github.com/Polaris-Wu450)
- Product Owner: [Milan Engineer](https://github.com/MilanEngineer)

**Sprint 2 Roles:**
- Scrum Master: [Polaris Wu](https://github.com/Polaris-Wu450)
- Product Owner: [Haroon Shafi](https://github.com/haroonshafi)

**Sprint 3 Roles:**
- Scrum Master: [Haroon Shafi](https://github.com/haroonshafi)
- Product Owner: [Laura Liu](https://github.com/lauraliu518)

**Sprint 4 Roles:**
- Scrum Master: [Laura Liu](https://github.com/lauraliu518)
- Product Owner: [Milan Engineer](https://github.com/MilanEngineer)

## Project History
NextQuad was developed in response to the challenges NYU students face in campus life:
- **Study Space Discovery**: Difficulty finding available study spaces during peak hours
- **Event Management**: Lack of a centralized platform for campus events and RSVPs
- **Community Connection**: Need for a safe, verified way to connect with other students
- **Campus Resources**: Limited access to dorm-specific information, marketplace, and campus map features

Our team came together in October 2025 as part of the Agile Software Development & DevOps course to build a solution that addresses these pain points through a single, integrated platform.

## Core Features

- Verified .edu email signup with dorm-based groups
- Categorized bulletin board (Lost & Found, Roommate Requests, Buy/Sell)
- Campus event feed with RSVP functionality
- Student marketplace for safe peer-to-peer trading
- Real-time safety alerts integrated with campus security
- Study Space Finder (interactive campus map, reservation, building infos, etc.)

## How to Contribute
Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our team workflow, development setup, and how to submit contributions.

## Building and Testing

### Sprint 1 - Frontend Development

**Prerequisites:**
- Node.js (v14 or higher)
- npm (comes with Node.js)

**Setup and Run:**
```bash
# Navigate to frontend directory
cd front-end

# Install dependencies
npm install

# Start development server
npm start
```

The application will open automatically at `http://localhost:3000`

### Sprint 2 & 3 - Backend Development & Database Integration

**Backend Prerequisites:**
- Node.js (v16 or higher)
- npm
- MongoDB (local or cloud instance like MongoDB Atlas)

**Backend Setup and Run:**
```bash
# Navigate to backend directory
cd back-end

# Install dependencies
npm install

# Create .env file with configuration (see Environment Variables section below)
# Refer to the example .env configuration in this README and create your .env file

# Start development server with auto-reload
npm run dev

# Or start in production mode
npm start
```

The backend API will be available at `http://localhost:3000`

**Frontend Setup:**
```bash
# Navigate to frontend directory
cd front-end

# Install dependencies
npm install

# Create .env file with configuration (see Environment Variables section below)
# Refer to the example .env configuration in this README and create your .env file

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000` (or another port if 3000 is taken)

**Running Backend Tests:**
```bash
cd back-end

# Run all tests with coverage
npm test

# Run tests with detailed HTML coverage report
npm run test:coverage
```

### Docker Setup

The application can be run using Docker and Docker Compose for easier deployment and consistency across environments.

**Prerequisites:**
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

**Quick Start:**
```bash
# Ensure you have a .env file in the root directory with required variables
# Then build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will be available at:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`

**Commands:**
```bash
# View logs
docker-compose logs -f                    # All services
docker-compose logs -f backend            # Backend only
docker-compose logs -f frontend           # Frontend only

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

**Troubleshooting:**
- **Backend can't connect to MongoDB**: Verify `MONGODB_URI` in `.env` and ensure MongoDB Atlas allows connections
- **Port conflicts**: Modify port mappings in `docker-compose.yml` if ports 3000 or 3001 are already in use
- **Frontend can't reach backend**: Ensure `REACT_APP_API_URL` in `.env` matches your backend URL

## Environment Variables

### Creating .env Files

Create `.env` files in both `back-end/` and `front-end/` directories using the examples below:

**Create `back-end/.env`:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nextquad
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_EXP_DAYS=60
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

**Create `front-end/.env`:**
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Replace the placeholder values (especially `your_google_maps_api_key_here`) with your actual configuration values.

## Additional Documentation

- UX Design
    - [App map](https://www.figma.com/board/vTVVOvkRhbJZ5ocEPmNmP4/NextQuad-App-Map?node-id=0-1&t=fsL1fobvha1VcIct-1)
    - [Wireframes](https://www.figma.com/design/d9sAx6JfiaAR5zUUyGk0eo/NextQuad-Wireframes?node-id=109-2&t=Aa42Mn15EePnCBLQ-1)
    - [Clickable Prototype](https://www.figma.com/proto/d9sAx6JfiaAR5zUUyGk0eo/NextQuad-Wireframes?node-id=137-198&p=f&t=ibm1yziOkpZqq0B0-1&scaling=min-zoom&content-scaling=fixed&page-id=109%3A2&starting-point-node-id=137%3A198)
    - [Design documentation](./UX-DESIGN.md)
- Sprint Planning:
    - [Product Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/1)
    - [Sprint 0 Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/2)
    - [Sprint 0 Task Board](https://github.com/orgs/agile-students-fall2025/projects/40/views/3)
    - [Sprint 1 Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/4)
    - [Sprint 1 Task Board](https://github.com/orgs/agile-students-fall2025/projects/40/views/5)
    - [Sprint 2 Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/6)
    - [Sprint 2 Task Board](https://github.com/orgs/agile-students-fall2025/projects/40/views/7)
    - [Sprint 3 Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/8)
    - [Sprint 3 Task Board](https://github.com/orgs/agile-students-fall2025/projects/40/views/9)
    - [Sprint 4 Backlog](https://github.com/orgs/agile-students-fall2025/projects/40/views/10)
    - [Sprint 4 Task Board](https://github.com/orgs/agile-students-fall2025/projects/40/views/11)

## Technology Stack

- **Frontend**: React
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Maps API**: Google Maps JavaScript API & Geocoding API
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## License
This project is licensed under the GNU General Public License v3.0 - see [LICENSE.md](./LICENSE.md)

## Additional Instructions
Several sets of instructions are included in this repository. They should each be treated as separate assignments with their own due dates and sets of requirements.

1. See the [App Map & Wireframes](instructions-0a-app-map-wireframes.md) and [Prototyping](./instructions-0b-prototyping.md) instructions for the requirements of the initial user experience design of the app.

2. Delete the contents of this file and replace with the contents of a proper README.md, as described in the [project setup instructions](./instructions-0c-project-setup.md)

3. See the [Sprint Planning instructions](instructions-0d-sprint-planning.md) for the requirements of Sprint Planning for each Sprint.

4. See the [Front-End Development instructions](./instructions-1-front-end.md) for the requirements of the initial Front-End Development.

5. See the [Back-End Development instructions](./instructions-2-back-end.md) for the requirements of the initial Back-End Development.

6. See the [Database Integration instructions](./instructions-3-database.md) for the requirements of integrating a database into the back-end.

7. See the [Deployment instructions](./instructions-4-deployment.md) for the requirements of deploying an app.
