import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, off, set } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";
import { database, auth } from "./firebase";
import { TreeClimbDetector } from "./utils/treeClimbLogic";
import AltitudeChart from "./components/AltitudeChart";
import Statistics from "./components/Statistics";
import SessionInfo from "./components/SessionInfo";

function App() {
  const [altitudeData, setAltitudeData] = useState([]);
  const [treeCount, setTreeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting");
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isNewSession, setIsNewSession] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Create tree climb detector instance
  const climbDetectorRef = useRef(new TreeClimbDetector());

  // Session management functions
  const startNewSession = async () => {
    try {
      // Generate new session ID
      const newSessionId = `session_${Date.now()}`;
      setCurrentSessionId(newSessionId);

      // Clear all previous data from Firebase
      await set(ref(database, "/AltitudeReadings"), {});

      // Reset local state
      setAltitudeData([]);
      setTreeCount(0);
      setSessionStartTime(null);
      setIsNewSession(true);
      climbDetectorRef.current.reset();

      console.log("🔄 New session started:", newSessionId);
    } catch (error) {
      console.error("❌ Error starting new session:", error);
      setError("Failed to start new session: " + error.message);
    }
  };

  const detectNewSession = (newData) => {
    if (newData.length === 0) return false;

    const latestTimestamp = newData[newData.length - 1].timestamp;
    const currentTime = Date.now() / 1000;
    const timeDiff = currentTime - latestTimestamp;

    // If latest data is more than 30 minutes old, treat as new session
    if (timeDiff > 1800) {
      console.log("⏰ Detected new session (data gap > 30 minutes)");
      return true;
    }

    return false;
  };

  const processExistingData = (formattedData) => {
    if (formattedData.length === 0) return;

    // Set session start time to earliest timestamp of existing data
    if (!sessionStartTime) {
      setSessionStartTime(formattedData[0].timestamp);
      console.log(
        "📅 Using existing session data, start time:",
        new Date(formattedData[0].timestamp * 1000).toLocaleString()
      );
    }

    // Process existing data with tree climbing logic
    const { climbCount } =
      climbDetectorRef.current.processAltitudeData(formattedData);
    setTreeCount(climbCount);

    console.log(`🌳 Existing session: ${climbCount} trees climbed`);
  };

  useEffect(() => {
    const handleFirebaseData = async () => {
      try {
        // Sign in to Firebase
        await signInWithEmailAndPassword(
          auth,
          import.meta.env.VITE_FIREBASE_USER_EMAIL,
          import.meta.env.VITE_FIREBASE_USER_PASSWORD
        );

        setAuthStatus("authenticated");
        console.log("✅ Signed in successfully");

        // Fetch altitude data
        const altitudeRef = ref(database, "/AltitudeReadings");
        onValue(
          altitudeRef,
          (snapshot) => {
            try {
              const data = snapshot.val();
              console.log("📊 Altitude data received:", data);

              if (data) {
                const formattedData = Object.keys(data)
                  .map((key) => {
                    const item = data[key];
                    // Handle ESP32 data format: {altitude: "value", timestamp: "value"}
                    return {
                      timestamp: parseInt(item.timestamp || key),
                      altitude: parseFloat(item.altitude || item),
                    };
                  })
                  .filter(
                    (item) => !isNaN(item.altitude) && !isNaN(item.timestamp)
                  )
                  .sort((a, b) => a.timestamp - b.timestamp);

                // Only check for new session if we haven't initialized yet
                if (!hasInitialized) {
                  // Check if this is a new session (only on first load)
                  if (detectNewSession(formattedData)) {
                    console.log(
                      "🔄 Auto-detected new session, clearing old data"
                    );
                    setAltitudeData([]);
                    setTreeCount(0);
                    setSessionStartTime(null);
                    setIsNewSession(true);
                    climbDetectorRef.current.reset();
                    setHasInitialized(true);
                    setLoading(false);
                    return;
                  } else {
                    // Process existing data normally
                    setAltitudeData(formattedData);
                    processExistingData(formattedData);
                    setIsNewSession(false);
                    setHasInitialized(true);
                    setLoading(false);
                    return;
                  }
                }

                // For subsequent updates, just update the data
                setAltitudeData(formattedData);

                // Only set session start time if not already set
                if (formattedData.length > 0 && !sessionStartTime) {
                  setSessionStartTime(formattedData[0].timestamp);
                  setIsNewSession(false);
                }

                // Process data with improved tree climbing logic
                const { climbCount } =
                  climbDetectorRef.current.processAltitudeData(formattedData);
                setTreeCount(climbCount);

                setLoading(false);
                console.log(`🌳 Trees climbed this session: ${climbCount}`);
              } else {
                setLoading(false);
                setError("No altitude data available in Firebase.");
              }
            } catch (err) {
              console.error("❌ Error processing altitude data:", err);
              setError("Failed to process altitude data: " + err.message);
              setLoading(false);
            }
          },
          (error) => {
            console.error("❌ Altitude data error:", error);
            setError("Failed to fetch altitude data: " + error.message);
            setLoading(false);
          }
        );

        // Cleanup function
        return () => {
          off(altitudeRef);
        };
      } catch (error) {
        console.error("❌ Authentication error:", error.message);
        setError(`Authentication failed: ${error.message}`);
        setLoading(false);
        setAuthStatus("failed");
      }
    };

    handleFirebaseData();
  }, [hasInitialized]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setAuthStatus("connecting");
    setSessionStartTime(null);
    setCurrentSessionId(null);
    setIsNewSession(false);
    setHasInitialized(false);
    climbDetectorRef.current.reset();
    window.location.reload();
  };

  if (authStatus === "connecting") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error: {error}</h2>
          <p className="mb-4">
            Please check the console for details and verify Firebase
            configuration.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading altitude data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🌴 Coconut Tree Climber Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            onClick={startNewSession}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            🆕 New Session
          </button>
          {currentSessionId && (
            <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
              Session: {currentSessionId.slice(-8)}
            </span>
          )}
        </div>
      </div>

      {isNewSession && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>New session started!</strong> Previous data has been
                cleared. Waiting for new altitude readings from your ESP32
                device.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isNewSession && altitudeData.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Existing session loaded!</strong> Showing data from
                previous session. Use "New Session" button to start fresh.
              </p>
            </div>
          </div>
        </div>
      )}

      {altitudeData.length > 0 ? (
        <div className="space-y-6">
          <Statistics
            altitudeData={altitudeData}
            treeCount={treeCount}
            sessionStartTime={sessionStartTime}
            climbDetector={climbDetectorRef.current}
          />

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Altitude Over Time
            </h2>
            <AltitudeChart
              altitudeData={altitudeData}
              sessionStartTime={sessionStartTime}
            />
          </div>

          <SessionInfo
            altitudeData={altitudeData}
            sessionStartTime={sessionStartTime}
            climbDetector={climbDetectorRef.current}
            currentSessionId={currentSessionId}
          />
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">
            No altitude data available. Please check your ESP32 connection.
          </p>
          {!isNewSession && (
            <button
              onClick={startNewSession}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Start New Session
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
