"use client";

import Image from "next/image";
import { motion } from "motion/react";

export type HeaderTextSegment = {
  text: string;
  className?: string;
};

export type HeaderImageItem = {
  src: string;
  alt: string;
  wrapperClassName: string;
  delay?: number;
  priority?: boolean;
};

export interface HeaderSectionProps {
  backgroundImageSrc: string;
  backgroundImageAlt: string;
  headlineSegments: HeaderTextSegment[];
  imageItems: HeaderImageItem[];
  overlayClassName?: string;
  containerClassName?: string;
  headlineClassName?: string;
  headlineWrapperClassName?: string;
}

export default function HeaderSection({
  backgroundImageSrc,
  backgroundImageAlt,
  headlineSegments,
  imageItems,

  headlineClassName = "font-heading text-2xl font-semibold tracking-tight text-white drop-shadow-xl md:text-3xl xl:text-4xl",
  headlineWrapperClassName = "absolute left-4 top-28 z-40 w-xs -translate-y-1/2 md:left-6 md:w-sm xl:top-1/4",
}: HeaderSectionProps) {
  return (
    <section className="relative h-[78vh] w-full overflow-hidden md:h-[82vh] z-0">
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

      <div className="absolute bottom-0 w-full">
        <div className="relative flex items-end justify-end">
          {imageItems.map((image) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: image.delay ?? 0,
                ease: "easeOut",
              }}
              className={image.wrapperClassName}
            >
              <div className="relative h-full w-full overflow-hidden rounded-t-full shadow-lg hidden lg:block">
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                  fill
                  sizes="12rem"
                  priority={image.priority}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
