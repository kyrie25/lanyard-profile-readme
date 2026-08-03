import type { ConfiguratorOptions } from "@/features/card/config/schema";
import { CARD_PARAMETER_INFO } from "@/features/card/config/schema";
import { ParameterField } from "@/features/configurator/ParameterField";

interface ParameterFormProps {
  options: ConfiguratorOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConfiguratorOptions>>;
}

export function ParameterForm({ options, setOptions }: ParameterFormProps) {
  const visibleDefinitions = CARD_PARAMETER_INFO.filter(
    definition => !definition.displayCondition || definition.displayCondition(options),
  );

  return (
    <div className="top-32 z-[2] flex h-auto flex-col overflow-hidden rounded-lg border border-white/5 bg-black/75 p-4 text-white shadow-[0_6px_50px_-25px_rgba(180,177,255,0.2)] backdrop-blur-xl max-sm:h-[30rem] max-sm:w-full max-sm:overflow-y-scroll sm:-left-[1rem] sm:w-[30rem] sm:max-w-[30rem]">
      <div className="grid-rows-auto mb-4 flex w-full flex-col gap-2.5 sm:grid sm:grid-cols-2">
        {visibleDefinitions
          .filter(definition => definition.type !== "boolean")
          .map(definition => (
            <ParameterField
              key={definition.parameter}
              definition={definition}
              options={options}
              setOptions={setOptions}
            />
          ))}
      </div>
      <div className="sm:grid-rows-auto flex flex-col gap-2 sm:grid sm:grid-cols-2">
        {visibleDefinitions
          .filter(definition => definition.type === "boolean")
          .map(definition => (
            <ParameterField
              key={definition.parameter}
              definition={definition}
              options={options}
              setOptions={setOptions}
            />
          ))}
      </div>
    </div>
  );
}
