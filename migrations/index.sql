CREATE TYPE role AS ENUM ('DOCTOR', 'PATIENT');

DROP TABLE IF EXISTS public.user;
CREATE TABLE public.user(
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL,
	phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
	email VARCHAR(50),
  address VARCHAR(255),
  specalizacion VARCHAR(100),
  experience varchar(100),
  patient_count VARCHAR(100),
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
  illness TEXT NOT NULL,
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
);

CREATE TABLE prescription_list(
	id BIGSERIAL PRIMARY KEY,
	prescription_master_lid INT NOT NULL,
	description TEXT NOT NULL,
  med_durations VARCHAR(255) NOT NULL,
	medicine_name VARCHAR(255) NOT NULL,
	timings JSONB NOT NULL,
	created_by VARCHAR(20) NOT NULL,
	created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by VARCHAR(20) NOT NULL,
	modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY(prescription_master_lid) REFERENCES prescription_master(id)
);

CREATE TABLE otp (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(255) NOT NULL,
    otp INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
	  valid_till TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
    created_by VARCHAR(20) NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
);

-- DROP FUNCTION insert_prescription_data(jsonb,character varying);
CREATE OR REPLACE FUNCTION insert_prescription_data(data JSONB, created_by VARCHAR)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    master_id BIGINT;
    prescription JSONB;
    report JSONB;
    timing JSONB;
    timing_entry JSONB;
BEGIN

    INSERT INTO prescription_master (
        name, phone, illness, voice_note, created_by, modified_by
    )
    VALUES (
        data->>'patient_name',
        data->>'patient_no',
        data->>'voice_path',
		data->>'illness',
        created_by,
        created_by
    )
    RETURNING id INTO master_id;

    FOR prescription IN SELECT * FROM jsonb_array_elements(data->'prescription')
    LOOP
        INSERT INTO prescription_list (
            prescription_master_lid, description, medicine_name, med_durations,timings, created_by, modified_by
        )
        VALUES (
            master_id,
            prescription->>'prescription_detail',
            prescription->>'medicine_name',
            prescription->>'med_durations',
            prescription->'timing',
            created_by,
            created_by
        );
    END LOOP;

    FOR report IN SELECT * FROM jsonb_array_elements(data->'required_report')
    LOOP
        INSERT INTO report (
            phone, name, prescription_master_lid, report_path, created_by, modified_by
        )
        VALUES (
            created_by,
            report->>'report_name',
            master_id,
            report->>'file_path',
            created_by,
            created_by
        );
    END LOOP;
	
	RETURN '{"status": 200, "message": "Prescription Added Successfully!"}';
END;
$BODY$;

SELECT * FROM insert_prescription_data(
'{
  "patient_name" : "rana das",
  "patient_no" : "9876543211",
  "illness" : "cough",
  "prescription" : 
  [
    {
      "prescription_detail" : "xyz",
      "medicine_name" : "abc",
      "med_durations" : "20"
      "timing":[{"breakfast" : "before"}, {"lunch":null},{"dinner":"after"}]
    },
    {
      "prescription_detail" : "xabc",
      "medicine_name" : "axyz",
      "med_durations" : "20"
      "timing":[{"breakfast" : "before"}, {"lunch":null},{"dinner":"after"}]
    }
  ],
  "required_report":
  [
    {
      "file_path":"abcdxyz",
      "report_name":"AAAA"
    },
    {
      "file_path":"bmwass",
      "report_name":"BBBB"
    }
  ],
  "voice_path":"hghhgjoho"
}', '');