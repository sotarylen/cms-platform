"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxItem {
    value: string
    label: string
}

interface ComboboxProps {
    items: ComboboxItem[]
    value?: string
    onChange: (value: string) => void
    onCreate?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
}

export function Combobox({
    items,
    value,
    onChange,
    onCreate,
    placeholder = "Select item...",
    searchPlaceholder = "Search...",
    emptyText = "No item found.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    const selectedItem = items.find((item) => item.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedItem ? selectedItem.label : (value && onCreate ? value : placeholder)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {onCreate && searchQuery ? (
                                <div className="p-2">
                                    <p className="text-sm text-muted-foreground mb-2">{emptyText}</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            onCreate(searchQuery)
                                            setOpen(false)
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create "{searchQuery}"
                                    </Button>
                                </div>
                            ) : (
                                emptyText
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={`${item.label}:::${item.value}`}
                                    className="cursor-pointer"
                                    onSelect={(currentValue) => {
                                        const parts = currentValue.split(":::");
                                        const id = parts.length > 1 ? parts[1] : parts[0];
                                        onChange(id === value ? "" : id);
                                        setOpen(false);
                                    }}
                                    onMouseDown={() => {
                                        onChange(item.value === value ? "" : item.value);
                                        setOpen(false);
                                    }}
                                    onClick={() => {
                                        onChange(item.value === value ? "" : item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
