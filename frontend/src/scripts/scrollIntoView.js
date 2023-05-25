export 	const scrollIntoView = (element, behavior = "auto", block = "end") => {
	if(element?.scrollIntoView) {
		element.scrollIntoView({ block, behavior })
	}
}