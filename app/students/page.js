import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";

export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session);
  return (
    <CrudPage
      title="Students"
      api="/api/students"
      canWrite={canWrite}
      extraActions={[{ label: "Report Card", hrefPrefix: "/api/report-card/" }, { label: "Admit Card", hrefPrefix: "/api/admit-card/" }]}
      fields={[
        { key: "name", label: "Full Name" },
        { key: "rollNo", label: "Roll Number" },
        { key: "className", label: "Class" },
        { key: "section", label: "Section" },
        { key: "gender", label: "Gender", type: "select", required: false, options: ["Male", "Female", "Other"] },
        { key: "dob", label: "Date of Birth", type: "date", required: false },
        { key: "phone", label: "Phone", required: false },
        { key: "email", label: "Email", type: "email", required: false },
        { key: "address", label: "Address", required: false },
        { key: "parentName", label: "Parent / Guardian", required: false },
        { key: "parentPhone", label: "Parent Phone", required: false },
        { key: "admissionDate", label: "Admission Date", type: "date", required: false },
        { key: "parentId", label: "Linked Parent Account ID (optional)", type: "number", required: false },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "rollNo", label: "Roll No" },
        { key: "className", label: "Class" },
        { key: "section", label: "Section" },
        { key: "phone", label: "Phone" },
        { key: "parentName", label: "Parent" },
      ]}
    />
  );
}