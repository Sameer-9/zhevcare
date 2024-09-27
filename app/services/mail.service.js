import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'akash.gadhave.ext@gmail.com', 
      pass: 'rpyv ekal imku evre', 
    },
  });

 export const sendEmail = (to, subject, text) => {
    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      text,
    };
  
    return transporter.sendMail(mailOptions);
  };


