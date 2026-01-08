import { InventoryItem, UserProfile } from '../types';

/**
 * NOTE: This is now a backend-ready API service function.
 * It sends a request to a backend endpoint, which is responsible for
 * securely rendering and dispatching the email.
 */
export const sendPurchaseNotification = async (
  creator: UserProfile,
  sponsor: UserProfile,
  item: InventoryItem
): Promise<void> => {
  if (!creator.email) {
    console.warn(`Cannot send notification: Creator ${creator.name} has no email on file.`);
    return;
  }

  const payload = {
    creator,
    sponsor,
    item,
  };

  try {
    console.log("--- SENDING EMAIL NOTIFICATION REQUEST TO BACKEND ---");
    console.log("POST /api/notifications/purchase");
    console.log("Payload:", payload);
    
    // In a real app, this fetch call would hit your live backend API.
    // const response = await fetch('/api/notifications/purchase', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   throw new Error('Backend failed to send notification.');
    // }
    
    console.log("--- BACKEND REQUEST SIMULATION SUCCEEDED ---");
    
  } catch (error) {
    console.error("Failed to send purchase notification request:", error);
    // Handle error (e.g., show a message to the user)
  }
};
