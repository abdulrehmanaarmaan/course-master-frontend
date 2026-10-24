import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function GuestRoute({ children }) {
    return getToken()
        ? <Navigate to="/" replace />
        : children;
}