"use client";

import Image from "next/image";

import { motion } from "motion/react";

const steps = [
  {
    eyebrow: "CRIE SEU PERFIL",
    number: "01",
    title: "Monte sua presença",
    description:
      "Mostre quem você é, no que trabalha e como pode ajudar pessoas da sua região com mais contexto e confiança.",
    cta: "Começar agora",
    href: "/signin",
  },
  {
    eyebrow: "ATENDA E CONECTE",
    number: "02",
    title: "Entre na comunidade",
    description:
      "Receba contatos, converse com mais clareza e aproxime seu trabalho de quem realmente precisa do seu serviço.",
    cta: "Ver oportunidades",
    href: "/search",
  },
  {
    eyebrow: "FORTALEÇA SUA MARCA",
    number: "03",
    title: "Construa reputação",
    description:
      "Avaliações e boas experiências ajudam seu perfil a ganhar mais credibilidade e gerar novas indicações.",
    cta: "Criar minha conta",
    href: "/signin",
  },
];

const authGalleryImages = [
  {
    src: "/Gemini_Generated_Image_81npfy81npfy81np.png",
    alt: "Ilustracao de criacao colaborativa",
    className: "col-span-8",
    delay: 0,
  },
  {
    src: "/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png",
    alt: "Ilustracao de aprendizado digital",
    className: "col-span-4",
    delay: 0.06,
  },
  {
    src: "/Gemini_Generated_Image_ndy0l8ndy0l8ndy0.png",
    alt: "Ilustracao de networking profissional",
    className: "col-span-4",
    delay: 0.12,
  },
  {
    src: "/Gemini_Generated_Image_xfqkexfqkexfqkex.png",
    alt: "Ilustracao de estudo online",
    className: "col-span-4",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_ez45xsez45xsez45.png",
    alt: "Ilustracao de comunidade criativa",
    className: "col-span-4",
    delay: 0.24,
  },
  {
    src: "/Gemini_Generated_Image_2guq8v2guq8v2guq.png",
    alt: "Ilustracao de portfolio digital",
    className: "col-span-4",
    delay: 0.3,
  },
  {
    src: "/Gemini_Generated_Image_cjqsrjcjqsrjcjqs.png",
    alt: "Ilustracao de ensino e troca de habilidades",
    className: "col-span-8",
    delay: 0.36,
  },
];

export default function Sectionstart() {
  return (
    <section id="como-funciona" className="bg-surface my-24 scroll-mt-24 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 lg:gap-8 gap-y-12 ">
          <div className="col-span-12 lg:col-span-6 space-y-8 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Estamos aqui para ajudar <br /> você a encontrar o que precisa.
              </h2>
              <p className="text-base font-normal text-gray-800">
                Buscando um profissional ou divulgando seu trabalho, a Skillsy é
                o seu lugar.
              </p>
            </motion.div>

            <div className=" space-y-4 ">
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
                  className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-[6.5rem_minmax(0,1fr)]"
                >
                  <div className="space-y-1">
                    {/* <p className="text-xs font-bold tracking-[0.22em] text-text-main">
                        {step.eyebrow}
                      </p> */}
                    <p className="font-heading text-4xl md:text-5xl leading-none font-semibold text-text-main">
                      {step.number}
                    </p>
                  </div>

                  <div className="max-w-md">
                    <h3 className="text-lg font-semibold text-text-main">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">
                      {step.description}
                    </p>
                    {/* <Link
                        href={step.href}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-600"
                      >
                        {step.cta}
                        <ArrowRight size={16} />
                      </Link> */}
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
                  className={`${image.className} group relative w-full h-full overflow-hidden rounded-xl`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
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
