import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useContext } from "react";
import { FaMemory, FaRegClock, FaThermometerHalf } from "react-icons/fa";
import { FiCpu, FiHardDrive } from "react-icons/fi";
import useSWR from "swr";
import { SettingsContext } from "utils/contexts/settings";

import Resources from "../../../components/widgets/widget/resources";
import ServiceResource from "../../../components/widgets/widget/service_resource";
import Error from "../components/error";

const cpuSensorLabels = ["cpu_thermal", "Core", "Tctl"];

function convertToFahrenheit(t) {
  return (t * 9) / 5 + 32;
}

export default function Widget({ service }) {
  const options = {
    index: 2,
    version: 4,
    cpu: true,
    mem: true,
    cputemp: true,
    uptime: true,
    disk: ["/"],
    diskUnits: "bytes",
    expanded: true,
    // "label": "Computer B",
    style: {
      header: "underlined",
      isRightAligned: false,
    },
    url: service.widget.url,
  };

  const { t, i18n } = useTranslation();
  const { settings } = useContext(SettingsContext);
  const diskUnits = options.diskUnits === "bbytes" ? "common.bbytes" : "common.bytes";

  const { data, error } = useSWR(
    `/api/widgets/glances?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`,
    {
      refreshInterval: 1500,
    },
  );

  if (error || data?.error) {
    return <Error />;
  }

  if (!data) {
    return null;
  }

  const unit = options.units === "imperial" ? "fahrenheit" : "celsius";
  let mainTemp = 0;
  let maxTemp = 80;
  const cpuSensors = data.sensors?.filter(
    (s) => cpuSensorLabels.some((label) => s.label.startsWith(label)) && s.type === "temperature_core",
  );
  if (options.cputemp && cpuSensors) {
    try {
      mainTemp = cpuSensors.reduce((acc, s) => acc + s.value, 0) / cpuSensors.length;
      maxTemp = Math.max(
        cpuSensors.reduce((acc, s) => acc + (s.warning > 0 ? s.warning : 0), 0) / cpuSensors.length,
        maxTemp,
      );
      if (unit === "fahrenheit") {
        mainTemp = convertToFahrenheit(mainTemp);
        maxTemp = convertToFahrenheit(maxTemp);
      }
    } catch (e) {
      // cpu sensor retrieval failed
    }
  }
  const tempPercent = Math.round((mainTemp / maxTemp) * 100);

  let disks = [];

  if (options.disk) {
    disks = Array.isArray(options.disk)
      ? options.disk.map((disk) => data.fs.find((d) => d.mnt_point === disk)).filter((d) => d)
      : [data.fs.find((d) => d.mnt_point === options.disk)].filter((d) => d);
  }

  const addedClasses = classNames("information-widget-glances ", { expanded: options.expanded });

  return (
    <Resources
      options={options}
      target={settings.target ?? "_blank"}
      additionalClassNames={addedClasses}
      innerClassNames="relative flex flex-col md:flex-row w-full service-container @container/service-card"
    >
      <div className="flex flex-row w-full @2xl/service-card:w-1/2">
        {options.cpu !== false && (
          <ServiceResource
            additionalClassNames="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center px-2 service-block"
            icon={FiCpu}
            value={t("common.number", {
              value: data.cpu.total,
              style: "unit",
              unit: "percent",
              maximumFractionDigits: 0,
            })}
            label={t("glances.cpu")}
            expandedValue={t("common.number", {
              value: data.load.min15,
              style: "unit",
              unit: "percent",
              maximumFractionDigits: 0,
            })}
            expandedLabel={t("glances.load")}
            percentage={data.cpu.total}
            expanded={options.expanded}
          />
        )}
        {options.mem !== false && (
          <ServiceResource
            additionalClassNames="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center px-2 service-block"
            icon={FaMemory}
            value={t("common.bytes", {
              value: data.mem.available,
              maximumFractionDigits: 1,
              binary: true,
            })}
            label={t("glances.free")}
            expandedValue={t("common.bytes", {
              value: data.mem.total,
              maximumFractionDigits: 1,
              binary: true,
            })}
            expandedLabel={t("glances.total")}
            percentage={data.mem.percent}
            expanded={options.expanded}
          />
        )}
      </div>
      <div className="flex flex-row w-full @2xl/service-card:w-1/2">
        {disks.map((disk) => (
          <ServiceResource
            additionalClassNames="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center px-2 service-block"
            key={`disk_${disk.mnt_point ?? disk.device_name}`}
            icon={FiHardDrive}
            value={t(diskUnits, { value: disk.free })}
            label={t("glances.free")}
            expandedValue={t(diskUnits, { value: disk.size })}
            expandedLabel={t("glances.total")}
            percentage={disk.percent}
            expanded={options.expanded}
          />
        ))}
        {options.cputemp && mainTemp > 0 && (
          <ServiceResource
            additionalClassNames="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center px-2 service-block"
            icon={FaThermometerHalf}
            value={t("common.number", {
              value: mainTemp,
              maximumFractionDigits: 1,
              style: "unit",
              unit,
            })}
            label={t("glances.temp")}
            expandedValue={t("common.number", {
              value: maxTemp,
              maximumFractionDigits: 1,
              style: "unit",
              unit,
            })}
            expandedLabel={t("glances.warn")}
            percentage={tempPercent}
            expanded={options.expanded}
          />
        )}
        {options.uptime && data.uptime && (
          <ServiceResource
            additionalClassNames="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center px-2 service-block"
            icon={FaRegClock}
            value={data.uptime.replace(" days,", t("glances.days")).replace(/:\d\d:\d\d$/g, t("glances.hours"))}
            label={t("glances.uptime")}
            percentage={Math.round((new Date().getSeconds() / 60) * 100).toString()}
          />
        )}
      </div>
    </Resources>
  );
}
