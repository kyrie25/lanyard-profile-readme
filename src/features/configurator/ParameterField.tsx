import React from "react";
import * as Icon from "lucide-react";
import type { ConfiguratorOptions, ParameterDefinition } from "@/features/card/config/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn, filterLetters } from "@/lib/utils";

function ParameterDescription({ description }: { description?: string }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Icon.InfoIcon size={16} className="rounded-md text-zinc-700 transition hover:text-gray-400" />
      </PopoverTrigger>
      <PopoverContent side="top" className="text-sm">
        {description?.split("\n").map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line.split(/(`[^`]*`)/g).map((part, partIndex) =>
              part.startsWith("`") && part.endsWith("`") ? (
                <code className="rounded-sm bg-gray-900 pr-1 pl-1" key={partIndex}>
                  {part.slice(1, -1)}
                </code>
              ) : (
                <React.Fragment key={partIndex}>{part}</React.Fragment>
              ),
            )}
            <br />
          </React.Fragment>
        ))}
      </PopoverContent>
    </Popover>
  );
}

interface ParameterFieldProps {
  definition: ParameterDefinition;
  options: ConfiguratorOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConfiguratorOptions>>;
}

export function ParameterField({ definition, options, setOptions }: ParameterFieldProps) {
  if (definition.type === "boolean") {
    const checked =
      definition.parameter in options
        ? options[definition.parameter] === "true"
        : definition.options?.defaultBool;

    return (
      <div className="flex flex-row items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          className={cn(
            "mt-0.5 max-h-4 min-h-4 max-w-4 min-w-4 cursor-pointer before:overflow-clip before:rounded-[0.25rem] after:absolute after:h-4 after:w-4 after:rounded-[0.25rem] after:border after:border-white/10 after:transition-all after:duration-150 after:ease-out",
            {
              "after:border-gray-200/50 after:bg-gray-500/40 checked:bg-gray-700": checked,
              "appearance-none after:bg-zinc-700/10 after:hover:bg-zinc-700/25": !checked,
            },
          )}
          checked={checked}
          onChange={event =>
            setOptions(previous => ({ ...previous, [definition.parameter]: event.target.checked.toString() }))
          }
        />
        <p className="text-gray-300" style={{ textDecoration: definition.deprecated ? "line-through" : "none" }}>
          {definition.title}
        </p>
        <ParameterDescription description={definition.description} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-300">{definition.title}</p>
        <ParameterDescription description={definition.description} />
      </div>
      {definition.type === "string" ? (
        <input
          className="relative h-8 w-full appearance-none rounded-md border border-white/10 bg-transparent px-2 py-0.5 text-sm transition-all duration-150 ease-out outline-none placeholder:text-white/30 focus:border-white/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={definition.options?.placeholder || "..."}
          onChange={event => {
            const value = filterLetters(event.target.value, definition.options?.omit);
            setOptions(previous => ({ ...previous, [definition.parameter]: value }));
          }}
          value={options[definition.parameter] || ""}
        />
      ) : (
        <div className="relative">
          <select
            value={options[definition.parameter] || ""}
            onChange={event =>
              setOptions(previous => ({ ...previous, [definition.parameter]: event.target.value }))
            }
            className={cn(
              "relative h-8 w-full appearance-none rounded-md border border-white/10 bg-black px-2 py-0.5 text-sm transition-all duration-150 ease-out outline-none placeholder:text-white/30 focus:border-white/50 disabled:cursor-not-allowed disabled:opacity-50",
              {
                "text-white/30 placeholder:text-white/30 hover:text-white focus:text-white":
                  !options[definition.parameter],
              },
            )}
          >
            <option value="" className="bg-black text-white">
              None
            </option>
            {definition.options.list.map(option => (
              <option value={option.value} key={option.value} className="bg-black text-white">
                {option.name}
              </option>
            ))}
          </select>
          <Icon.ChevronDown size={14} className="absolute top-0 right-2 my-auto flex h-full text-white/50" />
        </div>
      )}
    </div>
  );
}
