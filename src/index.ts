type FormatObjectType = {[key in Exclude<string, "config" | "full">]: string|boolean|number | (string|boolean|number)[]}

type TheProxy<Format = FormatObjectType> = Format & {
	(newSearch: Partial<Format>, navigate?: boolean): void
	config: {
		noReset: boolean;
		navigate: boolean,
	}
	full: Format
}

type UseSearchProxy <Format extends FormatObjectType = FormatObjectType> = TheProxy<Format>

const useSearch = < Format extends FormatObjectType = FormatObjectType>(config: TheProxy["config"] = {navigate: false, noReset: false}): UseSearchProxy<Format> => {
	const setSearch = (searchParams: URLSearchParams, navigate = config.navigate) => {
		if (typeof window !== 'undefined'){
			if (navigate){
				window.location.search = searchParams.toString()
			}
			else {
				window.history.pushState({}, '', `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)
			}
		}
	}
	const objToParams = (current: Format) => new URLSearchParams(Object.entries(current).reduce((full: [string, string][], [key, value]: [string, FormatObjectType[keyof FormatObjectType]]) => {
		if (Array.isArray(value)){
			return full.concat((value).reduce((full, v) => {
				return v === undefined ? full : [key, v.toString()]
			}, [])
		)		
		} else {
			return value === undefined ? full : full.concat([[key, value.toString()]])
		}
	}, [] as [string, string][]))
	const theProxy: UseSearchProxy<Format> = new Proxy((() => config) as unknown as TheProxy<Format>, {
		apply: (t, thisArg, [newSearch, navigate]) => {
			const searchParams = objToParams(newSearch)
			if (typeof window !== 'undefined'){
				setSearch(searchParams, navigate)
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
				if (value === undefined){
					delete current[p]
				}
				else {
					current[p] = value.toString();
				}
				const searchParams = objToParams(current)
				setSearch(searchParams)
				return true;
			}
			return false;
		},
		
	})
	return theProxy;
}

export default useSearch