# use-search-hook

This module allows you to manipulate your url search string on the fly without effort, with optional navigation in response to changes.

## Getting Started

To install, in terminal type

```
	npm i --save use-search-hook
```

then, in your react project, or in any other module context

```
import useSearch from 'use-search-hook';
```  

and finally, implement it by including that component within your code:

```
const search = useSeach<yourObjectStyle>(yourDefaultObject)
```

## Using the search

```
search.key = value
```
this would result in your url changing from yoursite.com/apath to yoursite.com/apath?key=value

```
search({a: "change", to: "search"})
```
this would result in your url changing from yoursite.com/apath to yoursite.com/apath?a=change&to=search