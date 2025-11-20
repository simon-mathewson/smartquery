import {
  addOrientationChangeListener,
  Orientation,
  getOrientationAsync,
  removeOrientationChangeListener,
} from "expo-screen-orientation";
import { useEffect, useState } from "react";

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>(
    Orientation.UNKNOWN
  );

  useEffect(() => {
    void getOrientationAsync().then(setOrientation);

    const listener = addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => removeOrientationChangeListener(listener);
  }, []);

  return orientation;
};
