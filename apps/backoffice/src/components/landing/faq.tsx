"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export type FaqItem = { question: string; answer: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  const toggle = (index: number) => setActive((curr) => (curr === index ? null : index));

  return (
    <section className="space-y-4 py-8">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">Preguntas frecuentes</h2>
        <p className="text-sm text-gray-600">
          Desplegá cada punto para conocer cómo trabajamos y qué esperamos de prestadores y clientes.
        </p>
      </header>
      <div className="divide-y rounded-lg border bg-white">
        {items.map((item, index) => {
          const isOpen = active === index;
          return (
            <div key={item.question} data-active={isOpen} className="p-4">
              <button
                type="button"
                onClick={() => toggle(index)}
                data-active={isOpen}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <span className="text-xl leading-none text-gray-500">{isOpen ? "-" : "+"}</span>
              </button>
              {isOpen ? <p className="mt-2 text-sm text-gray-600">{item.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
