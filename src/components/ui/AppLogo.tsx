const LOGO_SRC = `${import.meta.env.BASE_URL}app-icon.png`;

/** The app icon (the stethoscope tile from the home-screen icon), decorative. */
export function AppLogo({ size }: { size: number }) {
  return <img src={LOGO_SRC} alt="" width={size} height={size} draggable={false} className="shrink-0 select-none rounded-[19%] shadow-raise" />;
}
