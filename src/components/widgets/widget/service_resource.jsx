import UsageBar from "../resources/usage-bar";

export default function ServiceResource({
  children,
  icon,
  value,
  label,
  expandedValue = "",
  expandedLabel = "",
  percentage,
  expanded = false,
  additionalClassNames = "",
  wide = false,
}) {
  const Icon = icon;

  return (
    <div
      className={`bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-center text-center p-1 service-block ${additionalClassNames}`}
    >
      <Icon className="text-theme-800 dark:text-theme-200 w-5 h-5 resource-icon" />
      <div
        className={`flex flex-col ml-3 text-left ${expanded ? " expanded" : ""} ${
          wide ? "min-w-[120px] md:min-w-[160px]" : "min-w-[82px] @md:min-w-[120px]"
        }`}
      >
        <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">{value}</div>
          <div className="pr-1">{label}</div>
        </div>
        {expanded && (
          <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">{expandedValue}</div>
            <div className="pr-1">{expandedLabel}</div>
          </div>
        )}
        {percentage >= 0 && <UsageBar percent={percentage} additionalClassNames="resource-usage" />}
        {children}
      </div>
    </div>
  );
}
