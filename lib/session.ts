import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: number;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "zstudio_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
