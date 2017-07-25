declare type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';

declare type ResponsePackFormat = 'legacy' | 'old' | 'new';

declare type ResponsePackage = {
  data?: any,
  error?: {
    code: number,
    message: string,
    debugInfo: string
  },
  behavior?: {
    content: string,
    urlScheme: string,
    type: 'NOTICE' | 'ALERT' | 'TOAST'
  }
};

declare type ResponseOldPackage = {
  data?: any,
  error?: {
    alertMessage: string
  }
};
