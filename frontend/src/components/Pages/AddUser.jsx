import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import Toast from "../layout/Toast";
import { createUser, fetchCompanies } from "../../services/user";
import { getCookie, getCookieJSON } from "../../utils/cookies.js";

const validationSchema = yup.object({
  company_id: yup
    .number()
    .typeError("Company is required")
    .positive("Company is required")
    .required("Company is required"),
  role_id: yup
    .number()
    .typeError("Select a role")
    .positive("Select a role")
    .required("Role is required"),
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  personal_email: yup
    .string()
    .trim()
    .email("Enter a valid personal email")
    .required("Personal email is required"),
  company_email: yup
    .string()
    .trim()
    .email("Enter a valid company email")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  department: yup
    .string()
    .trim()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  position: yup
    .string()
    .trim()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  date_of_joining: yup.string().required("Joining date is required"),
});

const ROLE_OPTIONS = [
  { id: 1, value: "admin", label: "Admin" },
  { id: 2, value: "hr_officer", label: "HR Officer" },
  { id: 3, value: "payroll_officer", label: "Payroll Officer" },
  { id: 4, value: "employee", label: "Employee" },
];

const generateTempPassword = () => {
  const randomSegment = Math.random().toString(36).slice(-4).toUpperCase();
  const timestampSegment = Date.now().toString().slice(-4);
  return `WZ-${randomSegment}${timestampSegment}`;
};

const formatDateInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeRole = (roleValue) => {
  if (!roleValue) return null;
  if (typeof roleValue === "string") return roleValue.toLowerCase();
  if (typeof roleValue === "object") {
    if (roleValue.name) return String(roleValue.name).toLowerCase();
    if (roleValue.role_name) return String(roleValue.role_name).toLowerCase();
  }
  return null;
};

const allowedRoles = ["admin", "hr_officer"];

const AddUser = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const cookieUserData = useMemo(() => getCookieJSON("userData"), []);
  const cookieRole = useMemo(
    () => normalizeRole(cookieUserData?.role) || normalizeRole(cookieUserData?.role_name) || normalizeRole(getCookie("userRole")),
    [cookieUserData]
  );
  const cookieCompanyId = getCookie("userCompanyId");

  const userRole = useMemo(
    () =>
      normalizeRole(authUser?.role) ||
      normalizeRole(authUser?.role_name) ||
      normalizeRole(authUser?.roleName) ||
      cookieRole,
    [authUser, cookieRole]
  );
  const hasAccess = useMemo(() => (userRole ? allowedRoles.includes(userRole) : false), [userRole]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [generatedPassword, setGeneratedPassword] = useState(generateTempPassword);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const copyTimeoutRef = useRef(null);
  const today = useMemo(() => formatDateInput(new Date()), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      company_id: cookieCompanyId ? Number(cookieCompanyId) : "",
      role_id: "",
      name: "",
      personal_email: "",
      company_email: "",
      department: "",
      position: "",
      date_of_joining: today,
    },
    mode: "onBlur",
  });

  const selectedCompanyId = useMemo(() => (cookieCompanyId ? Number(cookieCompanyId) : null), [cookieCompanyId]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    const loadReferenceData = async () => {
      try {
        setLoading(true);
        setFormError("");

        if (!cookieCompanyId) {
          const companyResponse = await fetchCompanies();

          if (!companyResponse?.data?.length) {
            setFormError("No companies found. Please register a company first.");
          }

          const fallbackCompany = companyResponse?.data?.[0];
          if (fallbackCompany) {
            setValue("company_id", fallbackCompany.company_id, { shouldValidate: true, shouldDirty: false });
          }
        }
      } catch (error) {
        console.error("Failed to load reference data", error);
        const detail = error?.response?.data?.detail || error?.message || "Failed to load reference data.";
        setFormError(detail);
      } finally {
        setLoading(false);
      }
    };

    loadReferenceData();
  }, [hasAccess, cookieCompanyId, setValue]);

  useEffect(() => {
    if (cookieCompanyId) {
      setValue("company_id", Number(cookieCompanyId), { shouldValidate: true, shouldDirty: false });
    }
  }, [cookieCompanyId, setValue]);

  useEffect(() => {
    setValue("date_of_joining", today, { shouldValidate: true, shouldDirty: false });
  }, [today, setValue]);

  const handleCreateUser = async (values) => {
    if (!hasAccess) {
      setFormError("Access denied. Only Admin and HR can add users.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        company_id: cookieCompanyId ? Number(cookieCompanyId) : Number(values.company_id),
        role_id: Number(values.role_id),
        name: values.name.trim(),
        personal_email: values.personal_email.trim(),
        company_email: values.company_email?.trim() || null,
        password: generatedPassword,
        department: values.department?.trim() || null,
        position: values.position?.trim() || null,
        date_of_joining: values.date_of_joining
          ? new Date(values.date_of_joining).toISOString()
          : new Date().toISOString(),
      };

      const response = await createUser(payload);
      const createdName = response?.data?.name || "User";

      setToast({ show: true, message: `${createdName} has been added successfully.` });
      const nextPassword = generateTempPassword();
      setGeneratedPassword(nextPassword);
      setPasswordCopied(false);
      reset({
        company_id: cookieCompanyId ? Number(cookieCompanyId) : payload.company_id,
        role_id: "",
        name: "",
        personal_email: "",
        company_email: "",
        department: "",
        position: "",
        date_of_joining: formatDateInput(new Date()),
      });
    } catch (error) {
      console.error("Failed to create user", error);
      // Backend may return structured validation errors (e.g. FastAPI/Pydantic 422 detail array)
      const rawDetail = error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Failed to create user.";

      const formatDetail = (d) => {
        if (!d && d !== 0) return "Failed to create user.";
        if (Array.isArray(d)) {
          // typical FastAPI validation errors: [{loc:..., msg:..., type:...}, ...]
          return d
            .map((it) => {
              if (typeof it === "string") return it;
              if (it?.msg) return it.msg;
              if (it?.message) return it.message;
              try {
                return JSON.stringify(it);
              } catch (e) {
                return String(it);
              }
            })
            .join("; ");
        }
        if (typeof d === "object") {
          if (d?.message) return d.message;
          if (d?.detail && typeof d.detail === "string") return d.detail;
          try {
            return JSON.stringify(d);
          } catch (e) {
            return String(d);
          }
        }
        return String(d);
      };

      const detailMessage = formatDetail(rawDetail);
      setFormError(detailMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy password", error);
      setToast({ show: true, message: "Unable to copy password. Please copy it manually." });
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-5 right-5 z-50">
        <Toast
          show={toast.show}
          message={toast.message}
          onUndo={() => setToast({ show: false, message: "" })}
          onClose={() => setToast({ show: false, message: "" })}
        />
      </div>

      {(loading || submitting) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <Loader />
        </div>
      )}

      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-surface-muted/70">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-15%] top-[-20%] h-64 w-64 rounded-full bg-[var(--brand-purple)]/10 blur-3xl" />
          <div className="absolute bottom-[-25%] right-[-10%] h-80 w-80 rounded-full bg-[var(--accent-yellow-soft)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
          <header className="space-y-3">
            <span className="status-badge status-badge--yellow">Team Expansion</span>
            <h1 className="text-3xl font-semibold text-gray-900">Add a new team member</h1>
            <p className="max-w-2xl text-sm text-muted">
              Capture essential details for the new hire. Their password will be hashed automatically, and an Employee ID is generated the moment they join WorkZen.
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-muted">
              <span className="status-badge status-badge--green">
                Company ID: {selectedCompanyId ?? "Not Found"}
              </span>
              <span>This company is linked to your session and will be applied automatically.</span>
            </p>
          </header>

          {!hasAccess ? (
            <div className="rounded-3xl border border-[var(--brand-purple)]/20 bg-white/90 p-8 text-center shadow-[0_24px_60px_rgba(111,66,193,0.12)]">
              <h2 className="text-2xl font-semibold text-gray-900">Access restricted</h2>
              <p className="mt-3 text-sm text-muted">
                Only Admins and HR Officers can add new users. If you believe this is an error, please contact your administrator.
              </p>
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(111,66,193,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Back to team directory
              </button>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[var(--brand-purple)]/15 bg-white/95 p-8 shadow-[0_32px_70px_rgba(15,23,42,0.12)]">
              {formError && (
                <div className="status-badge status-badge--red mb-6" role="alert">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-8">
                <input type="hidden" {...register("company_id", { valueAsNumber: true })} />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="role_id">
                      Role<span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <select
                      id="role_id"
                      {...register("role_id", { valueAsNumber: true })}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                    >
                      <option value="">Select a role</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {errors.role_id && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.role_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="name">
                      Full name<span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Priya Kaur"
                      {...register("name")}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="personal_email">
                      Personal email<span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <input
                      type="email"
                      id="personal_email"
                      placeholder="priya.kaur@gmail.com"
                      {...register("personal_email")}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                      autoComplete="email"
                    />
                    {errors.personal_email && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.personal_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="company_email">
                      Company email
                    </label>
                    <input
                      type="email"
                      id="company_email"
                      placeholder="priya.kaur@workzen.com"
                      {...register("company_email")}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                      autoComplete="off"
                    />
                    {errors.company_email && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.company_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="password">
                      Temporary password<span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        id="password"
                        value={generatedPassword}
                        readOnly
                        className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-surface px-4 py-3 text-sm text-gray-900 placeholder:text-muted"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="inline-flex shrink-0 items-center rounded-full border border-[var(--brand-purple)]/40 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-purple)] transition-colors hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <p>They'll be asked to set a new password on their first login.</p>
                      {passwordCopied && <span className="text-[var(--brand-purple)]">Copied!</span>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="department">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      placeholder="People Operations"
                      {...register("department")}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="position">
                      Position / Title
                    </label>
                    <input
                      type="text"
                      id="position"
                      placeholder="HR Business Partner"
                      {...register("position")}
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-muted focus:border-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)]/25"
                    />
                    {errors.position && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.position.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="date_of_joining">
                      Date of joining
                    </label>
                    <input
                      type="date"
                      id="date_of_joining"
                      {...register("date_of_joining")}
                      readOnly
                      className="w-full rounded-2xl border border-[var(--brand-purple)]/20 bg-surface px-4 py-3 text-sm text-gray-900 placeholder:text-muted"
                    />
                    {errors.date_of_joining && (
                      <p className="mt-1 text-sm text-[var(--accent-red)]">{errors.date_of_joining.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const refreshedPassword = generateTempPassword();
                      setGeneratedPassword(refreshedPassword);
                      setPasswordCopied(false);
                      reset({
                        company_id: cookieCompanyId ? Number(cookieCompanyId) : "",
                        role_id: "",
                        name: "",
                        personal_email: "",
                        company_email: "",
                        department: "",
                        position: "",
                        date_of_joining: today,
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating..." : "Add user"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;
