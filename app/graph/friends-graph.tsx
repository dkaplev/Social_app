"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

type FriendNode = {
  id: string;
  name: string;
  temperature: string;
};

const colors: Record<string, string> = {
  WARM: "#10b981",
  COOLING: "#f59e0b",
  COLD: "#71717a",
};

export function FriendsGraph({ friends }: { friends: FriendNode[] }) {
  const router = useRouter();

  const positioned = useMemo(() => {
    const n = friends.length;
    const cx = 400;
    const cy = 240;
    const r = Math.min(200, 60 + n * 12);
    return friends.map((f, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        ...f,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });
  }, [friends]);

  return (
    <svg
      viewBox="0 0 800 480"
      className="h-auto w-full max-w-3xl rounded-xl border border-zinc-200 bg-zinc-50 transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <title>Friends by temperature</title>
      {positioned.map((n) => (
        <g
          key={n.id}
          transform={`translate(${n.x},${n.y})`}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => router.push(`/friends/${n.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(`/friends/${n.id}`);
          }}
          role="link"
          tabIndex={0}
        >
          <circle
            r={28}
            fill={colors[n.temperature] ?? colors.COLD}
            opacity={0.92}
          />
          <text
            textAnchor="middle"
            dy={4}
            className="fill-white text-[10px] font-medium"
            style={{ pointerEvents: "none" }}
          >
            {(n.name || "?").slice(0, 10)}
          </text>
        </g>
      ))}
    </svg>
  );
}
