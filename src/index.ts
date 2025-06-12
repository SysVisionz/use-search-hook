type FormatObjectType = {[key in Exclude<string, "config" | "full">]: string|boolean|number | (string|boolean|number)[]}

type TheProxy<Format = FormatObjectType> = Format & {
	(): (newSearch: Partial<Format>, navigate?: boolean) => void
	config: {
		noReset: boolean;
		navigate: boolean,
	}
	full: Format
}

type UseSearchProxy <Format extends FormatObjectType = FormatObjectType> = TheProxy<Format>

const useSearch = < Format extends FormatObjectType = FormatObjectType>(initialSeach: Format): UseSearchProxy<Format> => {
	let config: TheProxy["config"] = {
		navigate: false,
		noReset: false
	}
	const setSearch = (searchParams: URLSearchParams) => window.history.pushState({}, '', `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)
	const objToParams = (current: Format) => new URLSearchParams(Object.entries(current).reduce((full: [string, string][], [key, value]: [string, FormatObjectType[keyof FormatObjectType]]) => {
		if (typeof value === 'object'){
			return full.concat((value).map(v => [key, v.toString()]))
		} else {
			full.concat([key, value.toString()])
		}
	}, [] as [string, string][]))
	const theProxy: UseSearchProxy<Format> = new Proxy((() => initialSeach) as unknown as TheProxy<Format>, {
		apply: (t, thisArg, [newSearch, navigate]) => {
			const searchParams = new URLSearchParams(Object.entries(newSearch).filter(([_key, value]) => value != undefined).reduce((full: [string, string][], [key, value]: [string, string | boolean | number | (string|boolean|number)[]]) => {
				if (typeof value === 'object'){
					return full.concat(Object.values(value).map(v => [key, v.toString()]))
				}
				return full.concat([[key, value.toString()]])
			}, [] as [string, string][]))
			if (typeof window !== 'undefined'){
				setSearch(searchParams)
			}
		},
		get: (t, p, r) => {
			if (typeof window !== 'undefined'){
				const currentSearchParams = new URLSearchParams(window.location.search)
				const currentSearch = Array.from((currentSearchParams as unknown as {entries: () => [string, string][]}).entries()).reduce((full: Format, [key, value]: [keyof Format, string]) => {
					const theValue = value.match( /(^\d+$|^\d+\.\d+$)/) ? Number(value) : ['true', 'false'].includes(value) ? value === 'true' : value
					if (full[key]){
						(full[key] as (string|boolean|number)[]).push(theValue as string|boolean|number)
					}
					else {
						full[key as keyof Format] = theValue as Format[keyof Format]
					}
					return full;
				}, {} as Format)
				switch(p){
					case 'config':
						return config
					case 'full':
						return currentSearch
					default:
						return currentSearch[p as keyof typeof currentSearch]
				}

			}
		},
		set: (t, p, value, r) => {
			if (p === 'config'){
				config = value;
				return true;
			}
			if (typeof window !== 'undefined'){
				const current = r.full
				current[p] = value.toString();
				const searchParams = objToParams(current)
				setSearch(searchParams)
			}
		},
		
	})
	return theProxy;
}