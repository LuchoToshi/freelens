import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isValidHandle } from "@/lib/frontdesk/handles";
import { publicProfileByHandle } from "@/lib/frontdesk/server/publicProfile";
import { fdDict } from "@/lib/frontdesk/i18n";
import { PublicIntake } from "@/components/frontdesk/public-intake";

/**
 * The freelancer's public front door. To the client's eye this page IS the
 * product: photo, name, one line, the form — and no Freelens branding
 * anywhere (the site chrome is gated off this route).
 *
 * The handle is validated before any database work: every junk URL a scanner
 * throws at the root otherwise lands here.
 */
type Params = { handle: string };
type Search = { src?: string };

const SRC_CHANNELS = new Set(["ig", "tt", "li", "sig"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  if (!isValidHandle(handle)) return {};
  const profile = await publicProfileByHandle(handle);
  if (!profile) return {};
  const t = fdDict(profile.locale);
  return {
    title: `${profile.displayName} · ${t.public.craft[profile.craft]}`,
    description: profile.city
      ? `${t.public.craft[profile.craft]} · ${profile.city}`
      : t.public.craft[profile.craft],
  };
}

export default async function HandlePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { handle } = await params;
  if (!isValidHandle(handle)) notFound();

  const profile = await publicProfileByHandle(handle);
  if (!profile) notFound();

  const { src } = await searchParams;
  const srcChannel = src && SRC_CHANNELS.has(src) ? src : null;
  const t = fdDict(profile.locale);

  return (
    <main
      lang={profile.locale}
      className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:py-14"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        {profile.photoUrl && (
          <Image
            src={profile.photoUrl}
            alt=""
            width={96}
            height={96}
            className="size-24 rounded-full border border-[var(--fl-line)] object-cover"
          />
        )}
        <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
          {profile.displayName}
        </h1>
        <p className="text-sm text-[var(--fl-slate)]">
          {t.public.craft[profile.craft]}
          {profile.city ? ` · ${profile.city}` : ""}
        </p>
      </header>

      <PublicIntake
        handle={profile.handle}
        displayName={profile.displayName}
        locale={profile.locale}
        srcChannel={srcChannel}
      />
    </main>
  );
}
