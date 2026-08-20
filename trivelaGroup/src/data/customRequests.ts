import { supabase } from "../lib/supabase";

/*
 * Slanje zahteva za custom masku (Trivela Drop -> "Create your custom case").
 *
 * Slika ide u Storage bucket `custom-uploads` (kupac sme da otpremi), a podaci
 * u tabelu `custom_requests` (svako sme da ubaci, cita samo admin — RLS to
 * obezbedjuje). Isti obrazac kao admin panel; radi kad .env gleda na zivi
 * Supabase.
 */

export interface CustomRequestInput {
  fullName: string;
  email: string;
  phone: string;
  phoneModel: string;
  quantity: number;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
  imageUrl: string | null;
}

/* Otprema kupcevu sliku i vraca javni URL. new Date() je ok — korisnicka
   akcija u browseru, ne workflow skripta. */
export async function uploadCustomImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("custom-uploads")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("custom-uploads").getPublicUrl(path);
  return data.publicUrl;
}

export async function submitCustomRequest(
  input: CustomRequestInput
): Promise<void> {
  const { error } = await supabase.from("custom_requests").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim() || null,
    phone_model: input.phoneModel,
    quantity: input.quantity,
    address: input.address.trim() || null,
    city: input.city.trim() || null,
    postal_code: input.postalCode.trim() || null,
    country: input.country.trim() || null,
    notes: input.notes.trim() || null,
    image_url: input.imageUrl,
  });
  if (error) throw new Error(error.message);
}
