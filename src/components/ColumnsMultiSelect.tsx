"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
	allColumns: string[];
	visibleColumns: Set<string>;
	onToggle: (column: string) => void;
	onShowAll: () => void;
	onHideAll: () => void;
	buttonLabel?: string;
};

const ColumnsMultiSelect = ({
	allColumns,
	visibleColumns,
	onToggle,
	onShowAll,
	onHideAll,
	buttonLabel = "Columns",
}: Props) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const rootRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (!rootRef.current) return;
			if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, []);

	useEffect(() => {
		if (open) {
			// Small delay to ensure element is present in DOM
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	}, [open]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return allColumns;
		return allColumns.filter((c) => c.toLowerCase().includes(q));
	}, [allColumns, query]);

	const selectedCount = visibleColumns.size;
	const allCount = allColumns.length;

	if (!allColumns.length) return null;

	return (
		<div className="relative" ref={rootRef}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={`${buttonLabel} seçimi`}
				tabIndex={0}
				disabled={!allColumns.length}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
				}}>
				<span>{buttonLabel}</span>
				<span className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs font-medium text-white">
					{selectedCount}/{allCount}
				</span>
				<svg
					className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true">
					<path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
				</svg>
			</button>

			{open ? (
				<div
					role="dialog"
					aria-label="Sütun seçimi"
					className="absolute z-10 mt-2 w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
					<div className="flex items-center justify-between gap-2 border-b p-3">
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Sütunlarda ara"
								className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
								aria-label="Sütunlarda ara"
							/>
							<svg
								className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true">
								<path
									fillRule="evenodd"
									d="M9 3.5a5.5 5.5 0 103.473 9.8l3.613 3.614a.75.75 0 101.06-1.06l-3.614-3.614A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => {
									onShowAll();
									setQuery("");
								}}
								className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
								aria-label="Tüm sütunları göster">
								Tümünü seç
							</button>
							<button
								type="button"
								onClick={() => {
									onHideAll();
									setQuery("");
								}}
								className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
								aria-label="Tüm sütunları gizle">
								Temizle
							</button>
						</div>
					</div>
					<ul
						role="listbox"
						aria-multiselectable="true"
						className="max-h-64 overflow-auto p-2">
						{filtered.map((col) => {
							const checked = visibleColumns.has(col);
							return (
								<li key={col}>
									<label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-zinc-50">
										<input
											type="checkbox"
											checked={checked}
											onChange={() => onToggle(col)}
											className="h-4 w-4"
											aria-checked={checked}
											aria-label={`${col} sütununu ${checked ? "kaldır" : "ekle"}`}
										/>
										<span className="truncate">{col}</span>
									</label>
								</li>
							);
						})}
						{!filtered.length ? (
							<li className="px-2 py-1 text-sm text-zinc-500">Sonuç yok</li>
						) : null}
					</ul>
					<div className="flex items-center justify-between border-t p-2">
						<div className="px-2 text-xs text-zinc-600">
							Seçili: {selectedCount} / {allCount}
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm hover:bg-zinc-100"
								aria-label="Kapat">
								Kapat
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ColumnsMultiSelect;


