import { Capacitor } from "@capacitor/core";
import {
  Geolocation,
  PermissionStatus as GeolocationPermission,
} from "@capacitor/geolocation";
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed,
  PermissionStatus as PushPermission,
} from "@capacitor/push-notifications";

export type LocationPermissionState =
  | GeolocationPermission["location"]
  | GeolocationPermission["coarseLocation"];

const isNativePlatform = () => Capacitor.isNativePlatform();

/**
 * Request location permissions (safe to call from web; will no-op).
 */
export const requestLocationPermissions =
  async (): Promise<GeolocationPermission> => {
    if (!isNativePlatform()) {
      // Web: rely on browser permission prompt when calling getCurrentPosition.
      return Geolocation.checkPermissions();
    }

    const status = await Geolocation.checkPermissions();
    if (status.location === "granted" || status.coarseLocation === "granted") {
      return status;
    }
    return Geolocation.requestPermissions();
  };

export const getCurrentLocation = async () => {
  await requestLocationPermissions();
  return Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    maximumAge: 30_000,
    timeout: 20_000,
  });
};

export const watchLocation = async (
  onUpdate: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
) =>
  Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
    },
    (position, error) => {
      if (position) onUpdate(position);
      if (error && onError) onError(error);
    }
  );

export const clearWatch = async (id: string) => Geolocation.clearWatch({ id });

/**
 * Request push notification permissions (safe to call from web; will no-op).
 */
export const requestPushPermissions = async (): Promise<PushPermission> => {
  if (!isNativePlatform()) {
    // Web: PushNotifications plugin typically not available
    return { receive: "denied" } as PushPermission;
  }

  const status = await PushNotifications.checkPermissions();
  if (status.receive === "granted") return status;
  return PushNotifications.requestPermissions();
};

export const registerPush = async () => {
  if (!isNativePlatform()) return;
  await requestPushPermissions();
  return PushNotifications.register();
};

export const addPushListeners = async (
  onRegistration: (token: Token) => void,
  onNotification: (notification: PushNotificationSchema) => void,
  onAction?: (action: ActionPerformed) => void
) => {
  if (!isNativePlatform()) return;

  await PushNotifications.addListener("registration", onRegistration);

  await PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error", error);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    onNotification
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (actionEvent) => {
      onAction?.(actionEvent);
    }
  );
};
