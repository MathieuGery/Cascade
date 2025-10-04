interface MarbleIconProps {
  className?: string;
  animate?: boolean;
}

export default function MarbleIcon({ className = "", animate = false }: MarbleIconProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-lg ${
          animate ? 'animate-bounce' : ''
        }`}
      >
        {/* Reflet sur la bille */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-sm"></div>
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/60 rounded-full"></div>
      </div>
    </div>
  );
}
