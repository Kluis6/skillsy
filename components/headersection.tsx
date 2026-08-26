"use client";

import Image from "next/image";
import { motion } from "motion/react";

export type HeaderTextSegment = {
  text: string;
  className?: string;
};

export interface HeaderSectionProps {
  backgroundImageSrc: string;
  backgroundImageAlt: string;
  headlineSegments: HeaderTextSegment[];
  overlayClassName?: string;
  containerClassName?: string;
  headlineClassName?: string;
  headlineWrapperClassName?: string;
}

export default function HeaderSection({
  backgroundImageSrc,
  backgroundImageAlt,
  headlineSegments,

  headlineClassName = "font-heading text-2xl drop-shadow-lg font-semibold tracking-tight text-white drop-shadow-xl md:text-3xl xl:text-4xl",
  headlineWrapperClassName = "absolute left-4 top-28 z-40 w-xs -translate-y-1/2 md:left-6 md:w-sm xl:top-1/4",
}: HeaderSectionProps) {
  return (
    <section className="relative h-[78vh] w-full overflow-hidden md:h-[91dvh] z-0">
      <motion.div
        initial={{ scale: 1.04, opacity: 0.88 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 "
      >
        <Image
          src={backgroundImageSrc}
          alt={backgroundImageAlt}
          className="object-cover"
          fill
          sizes="100vw"
          priority
        />
      </motion.div>

      <div className={`absolute inset-0 bg-blue-700/30 brightness-60`} />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`${headlineWrapperClassName}`}
      >
        <h1 className={headlineClassName}>
          {headlineSegments.map((segment, index) => (
            <span key={`${segment.text}-${index}`} className={segment.className}>
              {segment.text}
            </span>
          ))}
        </h1>
      </motion.div>
    </section>
  );
}
