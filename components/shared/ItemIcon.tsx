"use client";

import React, { useState, useMemo, useEffect } from "react";

interface ItemIconProps {
  id: string;
  name: string;
  iconPath?: string;
  size?: number;
  className?: string;
  fallback?: string;
}

const palette = [
  "bg-gradient-to-br from-sky-500/80 to-blue-700/80",
  "bg-gradient-to-br from-emerald-500/80 to-green-700/80",
  "bg-gradient-to-br from-amber-500/80 to-orange-700/80",
  "bg-gradient-to-br from-violet-500/80 to-purple-700/80",
  "bg-gradient-to-br from-rose-500/80 to-red-700/80",
  "bg-gradient-to-br from-cyan-500/80 to-teal-700/80",
];

const pickGradient = (key: string) => {
  const code = Array.from(key).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return palette[code % palette.length];
};

export function ItemIcon({
  id,
  name,
  iconPath,
  size = 40,
  className,
  fallback,
}: ItemIconProps) {
  const [errored, setErrored] = useState(false);
  const gradient = pickGradient(id);
  const letter = (fallback || name || "?").slice(0, 1).toUpperCase();

  const resolvedPath = useMemo(() => {
    if (iconPath) return iconPath;
    return `/images/items/${id}.png`;
  }, [iconPath, id]);

  useEffect(() => {
    setErrored(false);
  }, [resolvedPath]);

  return (
    <div
      className={[
        "flex items-center justify-center rounded-md text-sm font-semibold text-white shadow-sm",
        gradient,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {!errored && resolvedPath ? (
        <img
          src={resolvedPath}
          alt={name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        letter
      )}
    </div>
  );
}

export default ItemIcon;
