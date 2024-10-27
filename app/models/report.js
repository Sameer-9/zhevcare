import sql from "../config/db.js";
import { infiniteScrollQueryBuilderWithPlaceholder } from "../utils/db/db-helper.js";

export const getHistory = async ({ cursor, search = "", filters }) => {
  console.log("Filters", filters);
  const data = await infiniteScrollQueryBuilderWithPlaceholder({
    baseQuery: `SELECT
                        pm.created_date AS date,
                        pm.name AS name,
                        pm.created_by AS doctor_name,
                        pm.illness,
                        json_agg(
                            json_build_object(
                              'report_name', r.name,
                              'report_url', r.report_path,
                              'timings', pl.timings,
                              'med_durations' , pl.med_durations,
                              'med_name', pl.medicine_name
                            )
                        ) AS reports
                    FROM prescription_master pm
                    JOIN prescription_list pl ON pm.id = pl.prescription_master_lid
                  LEFT JOIN report r ON pm.id = r.prescription_master_lid
                  INNER JOIN public.user pu ON pu.phone = pm.created_by

                    $PLACEHOLDER `,
    placeholders: [
      {
        placeholder: "$PLACEHOLDER",
        filters: {
          "pm.name": filters.name,
          "pm.created_by": filters.doctor_name,
          "pl.illness": filters.illness,
          "pm.created_date": filters.date,
          "pm.phone": filters.phone,
          "pm.created_by": filters.session_phone,
        },
        orderBy: { column: "pm.created_date", order: "desc" },
        defaultFilters: ` WHERE pm.active = TRUE
                    AND pl.active = TRUE
                    AND r.active = TRUE `,
        groupBy: [
          "pm.id",
          "pm.illness",
          "pm.created_by",
          "pm.created_date",
          "pm.name",
          "pu.name"
        ],
        orderBy: {
          column: "pm.id",
          order: "desc",
        },
        searchColumns: ["pm.name", "pm.created_by", "pm.illness", "pm.phone"],
      },
    ],
    cursor: {
      column: "pm.id",
      value: cursor,
    },
    includeTotalCount: false,
    search: search,
  });

  console.log("Data", data);

  return data;
};

export const getReport = async ({ cursor, search = "", filters }) => {
  const data = await infiniteScrollQueryBuilderWithPlaceholder({
    baseQuery: `SELECT * FROM report r $PLACEHOLDER`,
    placeholders: [
      {
        placeholder: "$PLACEHOLDER",
        filters: {
          "r.name": filters.name,
          "r.report_path": filters.url,
          "r.phone": filters.session_phone,
        },
        defaultFilters: ` WHERE r.active = TRUE `,
        orderBy: {
          column: "r.id",
          order: "desc",
        },
        searchColumns: ["r.name", "r.report_path", "r.phone"],
      },
    ],
    cursor: {
      column: "r.id",
      value: cursor,
    },
    search: search,
  });

  return data;
};

export const insertPrescriptionModal = async (prescriptionJson, user) => {
  const data =
    await sql`SELECT * FROM public.insert_prescription_data(${prescriptionJson}, ${user})`;
  return data[0];
};

export const soloReportModal = async (reportData, user) => {
  const data =
    await sql`INSERT INTO report(phone, name, report_path, created_by, modified_by)
                          VALUES(${user}, ${reportData.name}, ${reportData.report_path}, ${user}, ${user})`;
  return data[0];
};
