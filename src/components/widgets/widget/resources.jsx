import classNames from "classnames";

import ContainerLink from "./container_link";
import Raw from "./raw";
import WidgetLabel from "./widget_label";

export default function Resources({ options, children, target, additionalClassNames, innerClassNames }) {
  const widgetParts = [].concat(...children);
  const addedClassNames = classNames("information-widget-resources", additionalClassNames);

  return (
    <ContainerLink options={options} target={target} additionalClassNames={addedClassNames}>
      <Raw>
        <div className={classNames("flex flex-row self-center flex-wrap justify-between", innerClassNames)}>
          {widgetParts}
        </div>
        {widgetParts.filter((child) => child && child.type === WidgetLabel)}
      </Raw>
    </ContainerLink>
  );
}
