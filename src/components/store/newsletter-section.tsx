"use client";

import { FormEvent, useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail("");
  }

  return (
    <section className="bg-store-cream-dark px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-store-serif text-2xl leading-snug text-store-charcoal sm:text-3xl">
          Receba nossas novidades em primeira mão
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex items-end gap-4 border-b border-store-charcoal/30 pb-2"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            E-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="min-w-0 flex-1 bg-transparent font-store-sans text-sm text-store-charcoal placeholder:text-store-charcoal/40 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-gold transition-opacity hover:opacity-70"
          >
            Inscrever →
          </button>
        </form>
      </div>
    </section>
  );
}
