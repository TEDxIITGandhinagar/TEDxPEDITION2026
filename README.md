# TEDxIITGandhinagar - Innovation Challenge Platform

A React-based web application for managing TEDx innovation challenges with real-time team tracking, location-based progression, and role-based access control.

## Features

### 🔐 Authentication & Authorization
- Google Sign-in integration
- Role-based routing (Super Admin, Admin, Candidate)
- Automatic redirection based on user role

### 🎮 Game Mechanics
- **5 Location Progression**: Teams progress through 5 different locations in a circular pattern
- **Password Protection**: Each location has a unique password known to location admins
- **Video Integration**: 1-minute videos at each location
- **5-Minute Timer**: Teams have 5 minutes to complete challenges
- **Time-Based Scoring**: Fair scoring system based on completion time
- **Real-Time Updates**: Live scoreboard and team progress tracking

### 📊 Admin Features
- **Event Stage Control**: Start, pause, resume, and end events
- **Real-Time Monitoring**: Live dashboard with team statistics
- **Scoreboard Management**: Track team performance and scores
- **Location Management**: View and manage all challenge locations

### 🏆 Super Admin Features
- **System Analytics**: Advanced analytics and reporting
- **Database Operations**: Export data, backup system, reset teams
- **System Management**: Update passwords, modify locations, emergency controls

## Tech Stack

- **Frontend**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.1
- **Authentication**: Firebase Authentication
- **Database**: Firestore (Firebase)
- **Routing**: React Router DOM 7.7.0
- **Icons**: Font Awesome 6.0.0

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Loading.js      # Loading spinner component
├── context/            # React context providers
│   └── AuthContext.js  # Authentication context
├── pages/              # Main application pages
│   ├── Login.js        # Google sign-in page
│   ├── Candidate.js    # Main game interface
│   ├── Admin.js        # Admin dashboard
│   └── SuperAdmin.js   # Super admin dashboard
├── services/           # API and service functions
│   ├── firebase.js     # Firebase configuration
│   └── gameService.js  # Game logic and data management
└── App.js              # Main application component
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### 2. Installation

```bash
# Navigate to project directory
cd TEDxIITGandhinagar-26-Orientation

# Install dependencies
npm install

# Start development server
npm start
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google Sign-in
3. Enable Firestore Database
4. Update `src/services/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Database Setup

Create the following Firestore collections:

#### Teams Collection
```javascript
{
  id: "team_1",
  name: "Team Alpha",
  status: "available",
  assigned: false,
  currentLocation: 1,
  totalScore: 0,
  lastUpdated: timestamp
}
```

#### Super Admins Collection
```javascript
{
  email: "superadmin@example.com"
}
```

#### Admins Collection
```javascript
{
  email: "admin@example.com"
}
```

#### Event Collection
```javascript
{
  id: "stage",
  stage: "waiting", // waiting, active, paused, ended
  startTime: timestamp,
  updatedAt: timestamp
}
```

#### Scoreboard Collection
```javascript
{
  teamId: "team_1",
  location: 1,
  score: 150,
  timeTaken: 180,
  timestamp: timestamp
}
```

## Game Flow

### For Candidates (Teams)
1. **Sign In**: Use Google account to sign in
2. **Team Assignment**: Automatically assigned to an available team
3. **Location Progression**: 
   - Enter location password
   - Watch 1-minute video
   - Complete challenge within 5 minutes
   - Submit answer (success/failure)
   - Progress to next location
4. **Final Destination**: All teams converge at Panchangan for final celebration

### For Admins
1. **Event Control**: Start, pause, or end the event
2. **Live Monitoring**: View real-time team progress and scores
3. **Location Management**: Access location passwords and tasks
4. **Scoreboard**: Track team performance

### For Super Admins
1. **System Overview**: Complete system statistics
2. **Analytics**: Detailed location and team analytics
3. **System Management**: Database operations and system settings
4. **Advanced Controls**: Emergency controls and system modifications

## Location Configuration

The game includes 6 locations:

1. **Jasubhai Hall** - Starting point
2. **Rangmanch** - Knowledge challenge
3. **New PC Building** - Creativity challenge
4. **Academic Block 10** - Team collaboration
5. **Sports Complex** - Final presentation
6. **Panchangan** - Grand finale (common destination)

Each location has:
- Unique password
- Specific task description
- Color-coded interface
- Time-based scoring

## Scoring System

- **Base Score**: 100 points per successful completion
- **Time Bonus**: Faster completion = more points
- **Perfect Bonus**: 50 extra points for completion within 60 seconds
- **Formula**: `Base Score + Time Bonus + Perfect Bonus`

## Security Features

- Role-based access control
- Password-protected locations
- Real-time authentication
- Secure Firebase integration
- Session management

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for TEDxIITGandhinagar. All rights reserved.

## Support

For technical support or questions, please contact the development team.

---

**TEDxIITGandhinagar - Innovation Challenge Platform**
*Empowering innovation through technology*