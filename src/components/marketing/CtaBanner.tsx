import { Link } from "@tanstack/react-router";

/** Landing footer promo — static banner art from `/public/bannerlanding.png`. */
export function CtaBanner() {
  return (
    <section className="container-page py-10 sm:py-14">
      <Link
        to="/marketplace"
        className="block overflow-hidden rounded-2xl shadow-soft transition-opacity hover:opacity-[0.98]"
      >
        <img
          src="/bannerlanding.png"
          alt="Buy more. Build trust. Get credit limit — complete 15 orders to unlock your credit limit."
          width={1600}
          height={640}
          className="h-auto w-full object-cover object-center"
          loading="lazy"
        />
      </Link>
    </section>
  );
}
