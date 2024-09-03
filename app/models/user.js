import sql from "../config/db.js";

export const findOne = async ({ phone }) => {
  const data = await sql`SELECT * FROM public.user WHERE phone = ${phone}`;
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

export const updateProfileModal = async (userData, user ) => {
  const data = await sql`UPDATE public.user
                            SET
                                name = ${userData.name},
                                email = ${userData.email},
                                address = ${userData.address},
                                specalizacion = ${userData.specalizacion},
                                experience = ${userData.experience},
                                patient_count = ${userData.patient_count},
                            WHERE phone = ${user} AND active=true; `;
  return data[0];
};
