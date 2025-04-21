/**
 * Consistently handle API errors and produce user-friendly messages
 */
export const handleApiError = (error: unknown, defaultMessage: string): string => {
  // If it's an Error object
  if (error instanceof Error) {
    console.error(`${defaultMessage}: ${error.message}`, error);
    return error.message;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    console.error(`${defaultMessage}: ${error}`);
    return error;
  }
  
  // If it's something else (object with message, etc)
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String(error.message);
    console.error(`${defaultMessage}: ${msg}`, error);
    return msg;
  }
  
  // Default case - unknown error type
  console.error(defaultMessage, error);
  return defaultMessage;
};

/**
 * Try to parse JSON from a response, with error handling
 */
export const safeJsonParse = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response', error);
    throw new Error('Invalid response from server');
  }
};

/**
 * Fetch wrapper with built-in error handling
 */
export const safeFetch = async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMsg: string;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || `HTTP error ${response.status}`;
      } catch {
        errorMsg = `HTTP error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMsg);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    throw error; // Rethrow for the caller to handle with handleApiError
  }
};