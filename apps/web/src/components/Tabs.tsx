interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  "data-testid"?: string;
}

export function Tabs({ tabs, activeTab, onChange, "data-testid": testid }: Props) {
  return (
    <div
      role="tablist"
      data-testid={testid}
      className="mb-6 flex border-b border-slate-700"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          data-testid={testid ? `${testid}-${tab.id}` : undefined}
          onClick={() => onChange(tab.id)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
