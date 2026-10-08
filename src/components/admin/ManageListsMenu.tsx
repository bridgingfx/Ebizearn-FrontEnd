import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Layers, ListChecks, ListTree, Tags, Wand2 } from 'lucide-react';

const ITEMS = [
  { tab: 'all', label: 'All dropdowns', hint: 'Every dropdown and where it is managed', icon: ListTree },
  { tab: 'types', label: 'Task types', hint: 'Add / edit / delete task types', icon: Layers },
  { tab: 'categories', label: 'Categories', hint: 'Add / edit / delete categories', icon: Tags },
  { tab: 'presets', label: 'Wizard presets', hint: 'What templates pre-fill in the wizard', icon: Wand2 },
];

/** Task Library header: "Manage ▾" menu opening the Dropdown lists page. */
export const ManageListsMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
      >
        <ListChecks className="w-4 h-4" /> Manage <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl z-40 p-1.5">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Dropdown lists</p>
          {ITEMS.map((it) => (
            <Link
              key={it.tab}
              role="menuitem"
              to={`/admin/dropdown-lists?tab=${it.tab}`}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <it.icon className="w-4 h-4 text-[#168BFF] mt-0.5 shrink-0" />
              <span>
                <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{it.label}</span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">{it.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
