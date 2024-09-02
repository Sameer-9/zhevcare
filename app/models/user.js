import sql from "../config/db.js";

export const findOne = async ({ phone }) => {
  const data = await sql`SELECT * FROM public.user WHERE email = ${phone}`;
  return data[0];
};

export const save = async ({
  name,
  phone,
  email,
  password,
  registrationNo,
  isverified,
}) => {
  await sql`INSERT INTO public.user (name, phone, email, password, registration_no, is_verified) VALUES 
              (${name}, ${phone}, ${email}, ${password}, ${registrationNo}, ${isverified})`;
};
