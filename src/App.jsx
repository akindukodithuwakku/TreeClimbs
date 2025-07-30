import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, off } from "firebase/database";
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

  // Create tree climb detector instance
  const climbDetectorRef = useRef(new TreeClimbDetector());

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

                setAltitudeData(formattedData);

                // Set session start time (earliest timestamp)
                if (formattedData.length > 0 && !sessionStartTime) {
                  setSessionStartTime(formattedData[0].timestamp);
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
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setAuthStatus("connecting");
    setSessionStartTime(null);
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
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🌴 Coconut Tree Climber Dashboard
      </h1>

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
          />
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">
            No altitude data available. Please check your ESP32 connection.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
