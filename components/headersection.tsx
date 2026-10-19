"use client";

import Image from "next/image";
import { HERO_OVERLAY_CLASS } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export type HeaderTextSegment = {
  text: string;
  className?: string;
};

export interface HeaderSectionProps {
  backgroundImageSrc: string;
  backgroundImageAlt: string;
  headlineSegments: HeaderTextSegment[];
  /** Optional line under the headline, same formatting on every page. */
  description?: string;
  /** Extra classes for the background image, e.g. its object position. */
  imageClassName?: string;
  overlayClassName?: string;
  containerClassName?: string;
  headlineClassName?: string;
  headlineWrapperClassName?: string;
}

export default function HeaderSection({
  backgroundImageSrc,
  backgroundImageAlt,
  headlineSegments,
  description,
  imageClassName,
  overlayClassName = HERO_OVERLAY_CLASS,
  headlineClassName = "max-w-xl text-balance font-heading text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl xl:text-5xl",
  headlineWrapperClassName = "absolute inset-0 z-40 flex items-center",
}: HeaderSectionProps) {
  return (
    <section className="relative z-0 h-[52vh] w-full overflow-hidden md:h-[60vh]">
      <motion.div
        initial={{ scale: 1.04, opacity: 0.88 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={backgroundImageSrc}
          alt={backgroundImageAlt}
          className={cn("object-cover", imageClassName)}
          fill
          sizes="100vw"
          priority
        />
      </motion.div>

      <div className={`absolute inset-0 ${overlayClassName}`} />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`${headlineWrapperClassName}`}
      >
        <div className="container mx-auto px-4 pb-12">
          <h1 className={headlineClassName}>
            {headlineSegments.map((segment, index) => (
              <span key={`${segment.text}-${index}`} className={segment.className}>
                {segment.text}
              </span>
            ))}
          </h1>
          {description ? (
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/90 drop-shadow md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
