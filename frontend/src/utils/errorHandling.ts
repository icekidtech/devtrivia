/**
 * Consistently handle API errors and produce user-friendly messages
 */
export const handleApiError = (error: unknown): string => {
  // If it's an Error object
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`, error);
    return error.message;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    console.error(`Error: ${error}`);
    return error;
  }
  
  // If it's something else (object with message, etc)
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String(error.message);
    console.error(`Error: ${msg}`, error);
    return msg;
  }
  
  // Default case - unknown error type
  console.error('Unknown error', error);
  return 'An unknown error occurred';
};

/**
 * Log error details, optionally with context
 */
export const logError = (error: unknown, context?: string): void => {
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error('Error:', error);
  }
};

/**
 * Try to parse JSON from a response, with error handling
 */
export const safeJsonParse = async <T = unknown>(response: Response): Promise<T> => {
  try {
    return await response.json() as T;
  } catch (error) {
    console.error('Failed to parse JSON response', error);
    throw new Error('Invalid response from server');
  }
};

/**
 * Fetch wrapper with built-in error handling
 */
export const safeFetch = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
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
    
    return await safeJsonParse<T>(response);
  } catch (error) {
    throw error; // Rethrow for the caller to handle with handleApiError
  }
};