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

export const insertOTPModal = async (OTP, user, serviceName ) => {
  const data = await sql`INSERT INTO otp(phone, otp, service_name, created_by) 
                          VALUES(${user}, ${OTP}, ${serviceName}, ${user}) RETURNING id`;
  return data[0];
};

export const otpModal = async (id, otp, user) => {
  const data = await sql`SELECT true FROM otp WHERE id = ${id} 
                          AND valid_till > NOW() AND create_by = ${user} AND otp = ${otp}`;
  return data;
};

export const updatePasswordModal = async (password, user ) => {
  const data = await sql`UPDATE public.user u
                            SET password = ${password}
                            WHERE u.phone = ${user.phone} AND u.active = true;`;
  return data[0];
};
