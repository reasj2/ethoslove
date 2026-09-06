"use client";

import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI = [
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "💖", "💘", "💌", "💍", "🥂", "🎂", "🎉", "🎁", "🎈",
  "🌹", "🌷", "🌻", "🌸", "🌙", "⭐", "✨", "☀️", "🌈", "🔥", "🕯️", "🍰", "☕", "🍷", "🍕", "🎶",
  "✈️", "🚂", "🏡", "🌊", "🏔️", "🗺️", "📸", "📖", "💭", "🥹", "😭", "😂", "🥰", "😘", "🤭", "😌",
  "🐶", "🐱", "🐻", "🦋", "🐢", "🧸", "🫶", "🤝", "👑", "🎓", "🏆", "🙏", "🫂", "♾️", "💫", "🌟",
];

export function EmojiPicker({ onPick, label }: { onPick: (emoji: string) => void; label: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label} className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-ink/5">
          <Smile className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[18rem] p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI.map((e) => (
            <button key={e} type="button" onClick={() => onPick(e)} className="grid size-8 place-items-center rounded-md text-lg hover:bg-ink/5">
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
