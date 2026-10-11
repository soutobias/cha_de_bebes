type IconProps = { className?: string };
const Svg = ({ children, className }: React.PropsWithChildren<IconProps>) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
export const HeartIcon = (p: IconProps) => <Svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></Svg>;
export const CalendarIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></Svg>;
export const ClockIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Svg>;
export const PinIcon = (p: IconProps) => <Svg {...p}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></Svg>;
export const ExternalIcon = (p: IconProps) => <Svg {...p}><path d="M14 5h5v5M10 14 19 5M19 13v6H5V5h6"/></Svg>;
export function PeaMark() { return <svg className="h-10 w-13 shrink-0 max-sm:h-7.5 max-sm:w-10" viewBox="0 0 64 48" aria-hidden="true"><path d="M7 28C14 8 38 4 57 13c-2 21-21 30-40 23C10 34 7 28 7 28Z" fill="#729260"/><circle cx="25" cy="24" r="8" fill="#c5d39a"/><circle cx="41" cy="20" r="8" fill="#d9dfa9"/><path d="M4 29c5 1 7 5 7 9" fill="none" stroke="#526f46" strokeWidth="2" strokeLinecap="round"/></svg>; }
