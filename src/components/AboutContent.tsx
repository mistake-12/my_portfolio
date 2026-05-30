"use client";

import React from "react";
import { profile } from "@/data/profile";

function ProfilePhotoPlaceholder() {
  return (
    <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <span className="font-serif text-[120px] font-bold text-white/5 md:text-[160px]">
          M
        </span>
      </div>

      <div className="absolute inset-0 border border-white/20" />

      <svg
        className="absolute -left-[1px] -top-[1px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <line x1="0" y1="20" x2="0" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg
        className="absolute -right-[1px] -top-[1px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <line x1="20" y1="20" x2="20" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="20" y1="0" x2="0" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg
        className="absolute -bottom-[1px] -left-[1px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <line x1="0" y1="20" x2="0" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="20" x2="20" y2="20" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg
        className="absolute -bottom-[1px] -right-[1px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <line x1="20" y1="20" x2="20" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="20" y1="20" x2="0" y2="20" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    </div>
  );
}

const tagVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.3 + i * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function AboutContent() {
  const tags = [
    { label: "Location", value: profile.location },
    { label: "Focus", value: profile.focus },
    { label: "Status", value: profile.status },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl -translate-y-8 md:-translate-y-12">
      <div className="grid grid-cols-12 items-center gap-8 md:gap-12">
        {/* Avatar */}
        <div className="col-span-12 flex justify-center md:col-span-5">
          {profile.image ? (
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] overflow-hidden rounded-[20px] border-[2px] border-white">
              <img
                src={profile.image}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <ProfilePhotoPlaceholder />
          )}
        </div>

        {/* Text content */}
        <div className="col-span-12 md:col-span-7">
          <h2 className="mb-6 font-sans text-4xl font-semibold text-white sm:text-5xl">
            Hello, I&apos;m 马子航
          </h2>

          <p className="mb-10 max-w-xl font-sans text-lg font-light leading-relaxed text-zinc-400">
            {profile.bio}
          </p>

          {/* Tags */}
          <div className="mb-10 flex flex-wrap gap-3">
            {tags.map((tag, i) => (
              <div
                key={tag.label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-sans text-sm text-zinc-400"
              >
                <span className="font-medium text-white/60">{tag.label}</span>
                <span className="text-white">
                  {tag.value === "Available" ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {tag.value}
                    </span>
                  ) : (
                    tag.value
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="group flex cursor-pointer items-center gap-2">
            <span className="font-sans text-sm tracking-widest text-zinc-500 transition-colors duration-300 group-hover:text-white">
              Continue to explore
            </span>
            <svg
              className="h-4 w-4 text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
