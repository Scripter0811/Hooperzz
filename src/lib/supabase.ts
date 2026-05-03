import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  username: string;
  age: number;
  position: string;
  skill_level: string;
  coach_badge: boolean;
};

export type Upload = {
  id: string;
  user_id: string;
  video_url: string;
  title: string;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export type CoachApplication = {
  id: string;
  user_id: string;
  experience: string;
  certifications: string;
  bio: string;
  status: "pending" | "approved" | "denied";
};

export type CoachingRequest = {
  id: string;
  player_id: string;
  coach_id: string;
  message: string;
  status: "pending" | "accepted" | "declined";
};

export const ADMIN_USER_IDS: string[] = [
  "48ba19a8-f0c7-4268-ac8d-327e35d41ba1",
];
