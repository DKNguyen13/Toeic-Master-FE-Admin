import { formatDateDDMMYY } from "../utils/formatDateDDMMYY";

export const mapUser = (
  user: any,
  index: number,
  page: number,
  pageSize: number
) => ({
  id: (page - 1) * pageSize + index + 1,
  _id: user._id,
  fullname: user.fullname,
  email: user.email,
  phone: user.phone || "",
  authType: user.authType || "normal",
  registerDate: user.createdAt ? formatDateDDMMYY(user.createdAt) : "",
  status: user.isActive ? "Active" : "Inactive",
});