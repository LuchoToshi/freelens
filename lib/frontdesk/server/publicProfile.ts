/**
 * The ONE place the public page reads a freelancer.
 *
 * These reads use the service role because there are deliberately no anon RLS
 * policies — which means column discipline here is the entire guard. The
 * select list below is the complete set of columns a stranger may see. Never
 * `*`, never voice data, never anything that could route to the freelancer's
 * own identity beyond what they put on their public page.
 */
import { serviceClient } from "@/lib/frontdesk/server/clients";

export interface PublicProfile {
  handle: string;
  displayName: string;
  craft: "photographer" | "videographer";
  city: string | null;
  photoUrl: string | null;
  locale: "nl" | "en";
}

export async function publicProfileByHandle(handle: string): Promise<PublicProfile | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("freelancers")
    .select("handle, display_name, craft, city, photo_url, locale")
    .eq("handle", handle)
    .maybeSingle();
  if (error || !data) return null;
  return {
    handle: data.handle,
    displayName: data.display_name,
    craft: data.craft,
    city: data.city,
    photoUrl: data.photo_url,
    locale: data.locale,
  };
}
