"use client";

import Image from "next/image";

import { motion } from "motion/react";
import { useT } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";
import type { MessageKey } from "@skillsy/shared/i18n/keys";

const steps = [
  { number: "01", title: "join.step1Title", description: "join.step1Text" },
  { number: "02", title: "join.step2Title", description: "join.step2Text" },
  { number: "03", title: "join.step3Title", description: "join.step3Text" },
] satisfies { number: string; title: MessageKey; description: MessageKey }[];

const authGalleryImages = [
  {
    src: "/Gemini_Generated_Image_81npfy81npfy81np.png",
    alt: "auth.galleryCollaboration",
    className: "col-span-8",
    delay: 0,
  },
  {
    src: "/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png",
    alt: "auth.galleryLearning",
    className: "col-span-4",
    delay: 0.06,
  },
  {
    src: "/Gemini_Generated_Image_ndy0l8ndy0l8ndy0.png",
    alt: "auth.galleryNetworking",
    className: "col-span-4",
    delay: 0.12,
  },
  {
    src: "/Gemini_Generated_Image_xfqkexfqkexfqkex.png",
    alt: "auth.galleryStudy",
    className: "col-span-4",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_ez45xsez45xsez45.png",
    alt: "auth.galleryCommunity",
    className: "col-span-4",
    delay: 0.24,
  },
  {
    src: "/Gemini_Generated_Image_2guq8v2guq8v2guq.png",
    alt: "auth.galleryPortfolio",
    className: "col-span-4",
    delay: 0.3,
  },
  {
    src: "/Gemini_Generated_Image_cjqsrjcjqsrjcjqs.png",
    alt: "auth.gallerySkills",
    className: "col-span-8",
    delay: 0.36,
  },
] satisfies { src: string; alt: MessageKey; className: string; delay: number }[];

export default function Sectionstart() {
  const t = useT();
  return (
    <section id="como-funciona" className="bg-surface my-24 scroll-mt-24 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 lg:gap-8 gap-y-12">
          <div className="col-span-12 lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <h2 className="text-xl md:text-2xl font-bold text-text-main">
                {rich(t("join.helpTitle"), { br: <br /> })}
              </h2>
              <p className="text-base font-normal text-text-muted">
                {t("join.helpText")}
              </p>
            </motion.div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.1 + index * 0.08,
                    ease: "easeOut",
                  }}
                  className="grid gap-4 border-t border-border-subtle pt-5 md:grid-cols-[6.5rem_minmax(0,1fr)]"
                >
                  <div className="space-y-1">
                    
                    <p className="font-heading text-4xl md:text-5xl leading-none font-semibold text-text-main">
                      {step.number}
                    </p>
                  </div>

                  <div className="max-w-md">
                    <h3 className="text-lg font-semibold text-text-main">
                      {t(step.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">
                      {t(step.description)}
                    </p>
                    
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="grid grid-cols-12 gap-4 w-full lg:h-full h-[72vh]">
              {authGalleryImages.map((image) => (
                <motion.div
                  key={image.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: image.delay,
                    ease: "easeOut",
                  }}
                  className={`${image.className} group relative w-full h-full overflow-hidden`}
                >
                  <Image
                    src={image.src}
                    alt={t(image.alt)}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover bg-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
