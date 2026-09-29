// lib/auth/mock-session.ts
// Mock session context with role ('farmer' | 'officer' | 'admin') per tech spec §9.3, §12

export type UserRole = "farmer" | "officer" | "admin";

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  registeredBlockId: string;
  registeredDistrictId: string;
  language: string;
}

// Default mock profiles for seamless prototype demonstration
export const MOCK_SESSIONS: Record<UserRole, UserSession> = {
  farmer: {
    id: "usr_farmer_01",
    name: "Tariqul Islam",
    phone: "+880 1711-234567",
    role: "farmer",
    registeredBlockId: "blk_kurigram_01",
    registeredDistrictId: "kurigram",
    language: "en",
  },
  officer: {
    id: "usr_officer_01",
    name: "Dr. Nazmul Hossain (DAO)",
    phone: "+880 1819-876543",
    role: "officer",
    registeredBlockId: "blk_kurigram_05",
    registeredDistrictId: "kurigram",
    language: "en",
  },
  admin: {
    id: "usr_admin_01",
    name: "Kynatium Systems Admin",
    phone: "+880 1912-000000",
    role: "admin",
    registeredBlockId: "blk_kurigram_05",
    registeredDistrictId: "kurigram",
    language: "en",
  },
};

// Current active session state (in memory for prototype demo)
let currentSession: UserSession = MOCK_SESSIONS.officer; // Officer by default so both modes can be previewed freely

export function getSession(): UserSession {
  return currentSession;
}

export function setSessionRole(role: UserRole): UserSession {
  currentSession = { ...MOCK_SESSIONS[role] };
  return currentSession;
}
