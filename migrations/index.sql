CREATE TYPE role AS ENUM ('DOCTOR', 'PATIENT');

DROP TABLE IF EXISTS public.user;
CREATE TABLE public.user(
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL,
	phone VARCHAR(20) NOT NULL UNIQUE,
	email VARCHAR(50),
	registration_no VARCHAR(20),
	role role,
	is_verified BOOLEAN DEFAULT FALSE,
	created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN DEFAULT TRUE
);


CREATE TABLE prescription_master(
	id BIGSERIAL PRIMARY KEY,
	name NOT NULL,
	phone NOT NULL,
	voice_note VARCHAR(255),
	created_by VARCHAR(20) NOT NULL,
	created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by VARCHAR(20) NOT NULL,
	modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE report(
	id BIGSERIAL PRIMARY KEY,
	phone NOT NULL,
	name VARCHAR(255) NOT NULL,
	prescription_master_lid INT,FOREIGN KEY(prescription_master_lid) REFERENCES prescription_master(id),
	report_path VARCHAR(255) NOT NULL,
	created_by VARCHAR(20) NOT NULL,
	created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by VARCHAR(20) NOT NULL,
	modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN NOT NULL DEFAULT TRUE
)

CREATE TABLE prescription_list(
	id BIGSERIAL PRIMARY KEY,
	prescription_master_lid INT NOT NULL,
	illness TEXT NOT NULL,
	description TEXT NOT NULL,
	medicine_name VARCHAR(255) NOT NULL,
	timings JSONB NOT NULL,
	created_by VARCHAR(20) NOT NULL,
	created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by VARCHAR(20) NOT NULL,
	modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY(prescription_master_lid) REFERENCES prescription_master(id)
)