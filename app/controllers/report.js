import { getHistory, getReport, insertPrescriptionModal, soloReportModal } from "../models/report.js";
import { updateProfileModal } from "../models/user.js";

export const history = async (req, res) => {
  try {
    const user = req.user;

    const query = {
      cursor: req.query.cursor,
      search: req.query.search,
      filters: {
        name: req.query.name,
        doctor_name: req.query.doctor_name,
        illness: req.query.illness,
        date: req.query.date,
        phone: req.query.phone,
        session_phone: user.phone,
      },
    };

    const reports = await getHistory(query);
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Report list error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const report = async (req, res) => {
  try {
    const { cursor, search, filters } = req.query;
    const user = req.user;

    filters.session_phone = user.phone;

    const reports = await getReport({ cursor, search, filters });
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Report list error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const insertPrescription = async (req, res) => {
  try {
    const prescriptionJson = req.body;
    const user = req.user.phone;

    const reports = await insertPrescriptionModal(prescriptionJson, user);
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Report list error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userData = req.body;
    const user = req.user.phone;

    const reports = await updateProfileModal(userData, user);
    return res.status(200).json({
      message:"Profile updated successfully"
    });
  } catch (error) {
    console.error("Report list error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const soloReport = async (req, res) => {
  try {
    const reportData = req.body;
    const user = req.user.phone;

    const reports = await soloReportModal(reportData, user);
    return res.status(200).json({
      message:"Report saved successfully"
    });
  } catch (error) {
    console.error("Report list error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
