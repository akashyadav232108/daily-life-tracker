import { HiUserPlus, HiXMark } from 'react-icons/hi2';

/**
 * Soft prompt shown when a guest tries a save / DB action.
 * Matches app primary/teal tones; responsive on mobile → desktop.
 */
const RegisterPromptModal = ({ isOpen, onClose, onRegister, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-prompt-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white shadow-2xl transition-transform
                   sm:rounded-2xl animate-in fade-in
                   max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors
                     hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <HiXMark className="h-5 w-5" />
        </button>

        <div className="px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl
                          bg-teal-50 text-teal-600 ring-1 ring-teal-100 sm:h-14 sm:w-14">
            <HiUserPlus className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <h3
            id="register-prompt-title"
            className="text-center text-lg font-semibold text-gray-900 sm:text-xl"
          >
            Register to continue
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-gray-500">
            You can explore and fill in forms as a guest. Create a free account to save your data
            and unlock the full experience.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8">
            <button
              type="button"
              onClick={onRegister}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white
                         shadow-sm transition-colors hover:bg-primary-dark
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Create free account
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="w-full rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm
                         font-medium text-teal-800 transition-colors hover:bg-teal-50
                         focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              I already have an account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500
                         transition-colors hover:bg-gray-50 hover:text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPromptModal;
