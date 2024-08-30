import { HTTP_STATUS } from '$constants/http.constant';

export class CustomError extends Error {
   moduleName;
   status;
   httpStatus;
   date;
   error;
   validationErrors;

   constructor(err) {
      super(err.message);
      this.name = 'CustomError';
      this.moduleName = err.moduleName;
      this.status = HTTP_STATUS[err.status];
      this.httpStatus = err.status;
      this.date = new Date();
      this.error = err.error;
      this.validationErrors = err.validationErrors;
   }
}
