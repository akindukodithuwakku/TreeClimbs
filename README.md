# 🌴 Coconut Tree Climber Dashboard

A real-time dashboard for monitoring coconut tree climbing activities using ESP32, BME280 sensor, and Firebase.

## 🚀 Features

- **Real-time altitude monitoring** from ESP32 + BME280 sensor
- **Advanced tree climbing detection** based on 5m altitude changes (up & down)
- **Session-based analytics** with automatic reset on ESP32 restart
- **Interactive charts** with time range filtering
- **Responsive design** for mobile and desktop
- **Firebase integration** for real-time data storage

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Deployment**: Vercel

## 📊 Tree Climbing Logic

The dashboard uses an improved algorithm to detect tree climbs:

1. **Initial Baseline**: Sets the first altitude reading as the baseline
2. **Climb Detection**: Detects when altitude increases by 5m from baseline
3. **Climb Completion**: Counts a climb when altitude decreases by 5m from peak
4. **Session Management**: Resets counting when ESP32 restarts

### Climb Detection Flow:

```
Ground Level (10m) → Climbing (15m) → Peak (20m) → Descending (15m) → Ground (10m) = 1 Tree Climb
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AltitudeChart.jsx    # Interactive altitude visualization
│   ├── Statistics.jsx       # Key metrics display
│   └── SessionInfo.jsx      # Session details and climbing logic
├── utils/
│   └── treeClimbLogic.js    # Tree climbing detection algorithm
├── firebase.js              # Firebase configuration
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project with Realtime Database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd coconut-tree-climber-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Update `src/firebase.js` with your Firebase configuration
   - Ensure your Firebase Realtime Database has the correct rules

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 📱 ESP32 Integration

The dashboard expects data from your ESP32 in this format:

```json
{
  "AltitudeReadings": {
    "1703123456789": {
      "altitude": "15.5",
      "timestamp": "1703123456789"
    }
  }
}
```

### Required ESP32 Setup:

- BME280 sensor for altitude readings
- WiFi connection
- Firebase ESP32 Client library
- Data sent every 10 seconds

## 🚀 Deployment to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the Vite configuration
   - Deploy with default settings

3. **Environment Variables** (if needed)
   - Add Firebase configuration as environment variables in Vercel dashboard

## 📊 Dashboard Features

### Real-time Statistics

- **Trees Climbed**: Session-based count
- **Current Altitude**: Latest BME280 reading
- **Max Height**: Highest altitude reached
- **Climb Rate**: Trees per hour calculation

### Interactive Charts

- **Line/Bar Chart**: Toggle between visualization types
- **Time Filtering**: View last 5min, 15min, 30min, 1hour, or all data
- **Responsive Design**: Adapts to screen size
- **Tooltips**: Detailed information on hover

### Session Information

- **Session Duration**: Time since ESP32 started
- **Total Readings**: Number of altitude measurements
- **Average Altitude**: Mean altitude for the session
- **Climbing Status**: Real-time climbing state

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Realtime Database
3. Set up authentication (email/password)
4. Update database rules for read access
5. Update `src/firebase.js` with your config

### Database Rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **No data showing**

   - Check ESP32 connection
   - Verify Firebase authentication
   - Check browser console for errors

2. **Authentication errors**

   - Verify Firebase credentials
   - Check email/password in `App.jsx`

3. **Chart not rendering**
   - Ensure Chart.js dependencies are installed
   - Check for JavaScript errors in console

## 📈 Future Enhancements

- [ ] Multiple climber support
- [ ] Historical data analysis
- [ ] Export functionality
- [ ] Mobile app version
- [ ] Weather integration
- [ ] Performance analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ESP32 community for sensor integration
- Firebase for real-time database
- Chart.js for data visualization
- Vercel for hosting platform
