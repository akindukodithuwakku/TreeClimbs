# Session Management System

## Overview

Implemented a comprehensive session management system that properly handles existing data from past sessions without unnecessary clearing or refreshing.

## Problem Solved

- **Historical Data Issue**: System was showing all past data from database
- **Time Calculation Errors**: Session duration was calculated from earliest historical timestamp
- **No Session Isolation**: Previous sessions' data mixed with current session
- **Manual Session Control**: No way to start fresh sessions
- **Constant Refreshing**: System was clearing data unnecessarily

## Solution Implemented

### 1. Smart Session Detection & Management

#### Existing Session Handling

- **Preserve Existing Data**: Shows existing session data without clearing
- **Smart Initialization**: Only checks for new sessions on first load
- **No Constant Refreshing**: Avoids unnecessary data clearing
- **Proper Time Calculation**: Uses actual session start time

#### Automatic Session Detection

- **Time Gap Detection**: Automatically detects new sessions when there's a 30+ minute gap in data
- **Fresh Start**: Only clears previous session data when new session is detected
- **Smart Reset**: Resets climb detector and counters for new sessions

#### Manual Session Control

- **New Session Button**: Manual button to start fresh sessions
- **Data Clearing**: Clears all Firebase data when starting new session
- **Session ID**: Unique identifier for each session

### 2. Session State Management

```javascript
// New state variables
const [currentSessionId, setCurrentSessionId] = useState(null);
const [isNewSession, setIsNewSession] = useState(false);
const [hasInitialized, setHasInitialized] = useState(false);

// Session management functions
const startNewSession = async () => {
  // Clear Firebase data
  // Reset local state
  // Generate new session ID
};

const detectNewSession = (newData) => {
  // Check for 30+ minute gaps
  // Return true if new session detected
};

const processExistingData = (formattedData) => {
  // Process existing data without clearing
  // Set proper session start time
  // Calculate existing climbs
};
```

### 3. UI Enhancements

#### Session Controls

- **New Session Button**: Prominent button in header
- **Session ID Display**: Shows current session identifier
- **Session Status**: Visual indicators for new vs existing sessions

#### Information Display

- **Session Duration**: Accurate time calculation for current session only
- **Session Start Time**: Formatted timestamp display
- **Existing Session Info**: Clear indication when showing existing data
- **Management Instructions**: Updated guidance for users

## How It Works

### Session Lifecycle

1. **Initial Load**

   - Loads existing data from Firebase
   - Checks for time gaps to detect if new session needed (30+ minutes)
   - If existing session: preserves data and shows it
   - If new session: clears old data and starts fresh
   - Sets session start time to earliest current data timestamp

2. **Active Session**

   - Processes new altitude data in real-time
   - Calculates session duration from actual session start
   - Tracks climbs only for current session
   - No unnecessary refreshing or clearing

3. **Session Detection**

   - Monitors for 30+ minute gaps in data (increased from 5 minutes)
   - Only auto-detects on initial load, not continuously
   - Automatically clears old data and starts fresh when needed

4. **Manual Session Start**
   - User clicks "New Session" button
   - Clears all Firebase data immediately
   - Resets local state and starts fresh

### Time Calculation Fix

#### Before (Problematic)

```javascript
// Used earliest historical timestamp
const sessionStartTime = formattedData[0].timestamp; // Could be days old!
const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60;
```

#### After (Fixed)

```javascript
// Only uses current session timestamp
const sessionStartTime = currentSessionData[0].timestamp; // Current session only
const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60;
```

## Features

### Automatic Features

- ✅ **Smart session detection** (30+ minute gaps)
- ✅ **Existing data preservation**
- ✅ **Accurate time calculations**
- ✅ **No unnecessary refreshing**

### Manual Features

- ✅ **Manual session start** button
- ✅ **Session ID tracking**
- ✅ **Clear session information**
- ✅ **Reset all counters**

### UI Features

- ✅ **Session status indicators**
- ✅ **Duration formatting** (hours/minutes)
- ✅ **Session start time display**
- ✅ **Existing session notifications**
- ✅ **Updated management instructions**

## Benefits

1. **Accurate Time Tracking**: Session duration now reflects actual current session time
2. **Data Preservation**: Existing sessions are shown without clearing
3. **User Control**: Manual session management for different climbing sessions
4. **Smart Detection**: Intelligent detection of new sessions without constant checking
5. **Clear Information**: Users can see exactly when sessions start and how long they last
6. **No Constant Refreshing**: System doesn't unnecessarily clear or refresh data

## Usage

### Existing Sessions

- System automatically loads existing session data
- Shows "Existing session loaded!" notification
- Preserves all previous climbs and timing
- No data is cleared unless manually requested

### Starting a New Session

1. Click the "🆕 New Session" button in the header
2. System will clear all previous data
3. Wait for new altitude readings from ESP32
4. Session starts fresh with new data only

### Automatic Session Detection

- System automatically detects when ESP32 has been off for 30+ minutes
- Previous session data is cleared automatically only when needed
- New session starts when fresh data arrives

### Session Information

- **Session ID**: Unique identifier for tracking
- **Session Duration**: Accurate time for current session only
- **Session Start**: Formatted timestamp of when session began
- **Climb Count**: Only counts climbs from current session

## Technical Implementation

### Firebase Integration

```javascript
// Clear all data when starting new session
await set(ref(database, "/AltitudeReadings"), {});
```

### State Management

```javascript
// Reset all state for new session
setAltitudeData([]);
setTreeCount(0);
setSessionStartTime(null);
climbDetectorRef.current.reset();
```

### Time Gap Detection

```javascript
const timeDiff = currentTime - latestTimestamp;
if (timeDiff > 1800) {
  // 30 minutes
  // Start new session
}
```

### Existing Data Processing

```javascript
const processExistingData = (formattedData) => {
  // Set session start time to earliest timestamp
  setSessionStartTime(formattedData[0].timestamp);

  // Process existing data with tree climbing logic
  const { climbCount } =
    climbDetectorRef.current.processAltitudeData(formattedData);
  setTreeCount(climbCount);
};
```

## Files Modified

1. **`src/App.jsx`** - Main session management logic with smart initialization
2. **`src/components/SessionInfo.jsx`** - Updated session information display
3. **`src/components/Statistics.jsx`** - Updated time calculations
4. **`SESSION_MANAGEMENT.md`** - This documentation

## Future Enhancements

- **Session History**: Store completed sessions for review
- **Session Export**: Export session data to CSV/JSON
- **Session Templates**: Predefined session types
- **Advanced Analytics**: Cross-session performance analysis
