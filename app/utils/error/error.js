import { CustomError } from './customError';

export const invalidRequestError = (moduleName, message) => {
   console.log('INSIDE INVALID>>>>>>..', message);

   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Invalid Request',
      status: HTTP_STATUS.BAD_REQUEST,
   });
};

export const unauthorizedAccessError = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Unauthorized Access',
      status: HTTP_STATUS.UNAUTHORIZED,
   });
};

export const forbiddenAccessError = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Forbidden Access',
      status: HTTP_STATUS.FORBIDDEN,
   });
};

export const notFoundError = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Not Found',
      status: HTTP_STATUS.NOT_FOUND,
   });
};

export const internalServerError = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Internal Server Error',
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
   });
};

export const dbError = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'Internal Server Error',
      status: HTTP_STATUS.DATABASE_ERROR,
   });
};

export const noData = (moduleName, message) => {
   throw new CustomError({
      moduleName: moduleName || 'Unknown Module',
      message: message || 'No Data Available',
      status: HTTP_STATUS.DATABASE_ERROR,
   });
};
