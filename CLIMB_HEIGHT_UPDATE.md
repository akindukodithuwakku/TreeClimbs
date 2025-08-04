# Climbing Height Update: 5m → 3m

## Overview

Successfully updated the coconut tree climbing detection system to use a **3-meter threshold** instead of the previous 5-meter threshold for counting climbs.

## Changes Made

### 1. Core Logic Update (`src/utils/treeClimbLogic.js`)

- **Changed `minAltitudeChange` from 5 to 3 meters**
- **Improved climb tracking** with better start/end time recording
- **Enhanced climb data structure** to include:
  - `startAltitude`: Altitude when climb began
  - `endAltitude`: Altitude when climb completed
  - `totalAscent`: Total height gained during climb
  - `totalDescent`: Total height lost during descent
  - More accurate duration calculation

### 2. UI Updates

#### Statistics Component (`src/components/Statistics.jsx`)

- Added "Threshold: 3m" indicator in the Trees Climbed card
- Shows users the current detection threshold

#### Session Info Component (`src/components/SessionInfo.jsx`)

- Updated climbing logic description from "5m" to "3m"
- Added threshold display in current status section
- Shows real-time threshold value from detector

## How It Works

### Climb Detection Logic

1. **Climb Start**: When altitude goes above `base_altitude + 3m`
2. **Climb Completion**: When altitude drops below `peak_altitude - 3m`
3. **One Complete Climb**: Going up 3m+ from base AND coming down 3m+ from peak

### Example Scenario

```
Base Altitude: 10m
Climb Start: 13.5m (3.5m above base) ✅
Peak: 15m (5m above base)
Climb End: 12m (3m below peak) ✅
Result: 1 climb counted
```

## Benefits of 3m Threshold

1. **More Sensitive Detection**: Catches shorter climbs that were missed with 5m
2. **Better for Coconut Trees**: Most coconut trees are 15-25m tall, so 3m represents a meaningful climb
3. **Improved Accuracy**: Reduces false negatives for legitimate climbs
4. **Maintains Reliability**: Still filters out minor altitude fluctuations

## Technical Improvements

### Enhanced Data Tracking

- **Accurate timestamps**: Real climb start/end times instead of estimates
- **Detailed metrics**: Separate ascent/descent tracking
- **Better state management**: Improved reset and status tracking

### Robust Error Handling

- **Edge case handling**: Better handling of altitude fluctuations
- **State consistency**: Proper reset mechanisms
- **Data validation**: Improved input validation

## Testing Verification

The new logic was tested with simulated altitude data:

- ✅ Correctly detects climbs with 3m threshold
- ✅ Properly tracks climb start/end times
- ✅ Accurately calculates ascent/descent metrics
- ✅ Maintains state consistency across multiple climbs

## Backward Compatibility

- All existing functionality preserved
- No breaking changes to API
- Existing data structures maintained
- UI gracefully handles new data fields

## Files Modified

1. `src/utils/treeClimbLogic.js` - Core detection logic
2. `src/components/Statistics.jsx` - UI threshold display
3. `src/components/SessionInfo.jsx` - Updated documentation

## Next Steps

The system is now ready for production use with the 3-meter threshold. The changes provide:

- More accurate climb counting for coconut tree harvesting
- Better user experience with clearer threshold indicators
- Enhanced data collection for analysis and optimization
