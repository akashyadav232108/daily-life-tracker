import {
  HiBolt,
  HiHeart,
  HiClipboardDocumentList,
  HiCurrencyDollar,
  HiBell,
  HiShieldCheck,
} from 'react-icons/hi2';

const highlights = [
  {
    icon: HiClipboardDocumentList,
    title: 'Tasks',
    text: 'Plan your day, track streaks, and stay on top of what matters.',
  },
  {
    icon: HiHeart,
    title: 'Health & exercise',
    text: 'Log mood, sleep, workouts, and build habits that stick.',
  },
  {
    icon: HiCurrencyDollar,
    title: 'Expenses',
    text: 'Track spending, set budgets, and see monthly summaries at a glance.',
  },
  {
    icon: HiBell,
    title: 'Smart notifications',
    text: 'Gentle reminders and insights so you never miss a beat.',
  },
];

const AboutPage = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs
                        font-semibold uppercase tracking-wide text-teal-700 ring-1 ring-teal-100">
          <HiBolt className="h-3.5 w-3.5" />
          About us
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Daily Life Tracker
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          One calm place for your tasks, health, workouts, and expenses.
          Look around as a guest — when you&apos;re ready to begin, create a free account
          and make it yours.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {highlights.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm
                       transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl
                            bg-teal-50 text-teal-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80
                          to-sky-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                          bg-white text-teal-600 shadow-sm">
            <HiShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Start when you&apos;re ready</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              Explore every module freely — try the forms, learn the flow, no pressure.
              Register whenever you want to keep your progress. Your data stays private
              and secure once you have an account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
